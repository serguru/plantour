using System.Diagnostics;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using plantour_server.DbModels;
using plantour_server.Logging;
using plantour_server.Repositories;
using PlantourApi.Models;

namespace PlantourApi.Middleware;

public class ApiVisitLoggingMiddleware
{
    private const string DailyVisitCacheKeyPrefix = "api-visit";
    private const string DailyVisitLockCacheKeyPrefix = "api-visit-lock";
    private const string LoggerCategory = nameof(ApiVisitLoggingMiddleware);

    private readonly RequestDelegate _next;
    private readonly IPlantourLogger _logger;

    public ApiVisitLoggingMiddleware(RequestDelegate next, IPlantourLogger logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();

        await _next(context);

        stopwatch.Stop();

        try
        {
            var settingsRepository = context.RequestServices.GetRequiredService<SettingsRepository>();

            object? setting = await settingsRepository.GetSettingByKey("exclude_paths_from_log") ?? throw new CustomException("exclude_paths_from_log setting not found");
            string s = (string)setting;
            List<string> pathsToExclude = [.. s.Split(";")];


            string? path = context.Request.Path.HasValue ? context.Request.Path.Value : null;

            if (path == null)
            {
                return;
            }

            path = path.Trim('/');

            if (pathsToExclude.Any(x => String.Equals(x, path, StringComparison.OrdinalIgnoreCase)))
            {
                return;
            }

            var db = context.RequestServices.GetRequiredService<PlantourContext>();
            var memoryCache = context.RequestServices.GetRequiredService<IMemoryCache>();
            var currentUser = context.Items["CurrentUser"] as CurrentUser;
            var visitRecordedAtUtc = DateTime.UtcNow;
            var remoteIpAddress = context.Connection.RemoteIpAddress;

            if (await HasVisitBeenRecordedTodayAsync(
                db,
                memoryCache,
                remoteIpAddress,
                currentUser,
                visitRecordedAtUtc,
                context.RequestAborted))
            {
                return;
            }

            var endpoint = context.GetEndpoint()?.DisplayName;
            var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            var userAgent = context.Request.Headers["User-Agent"].FirstOrDefault();
            var referrer = context.Request.Headers["Referer"].FirstOrDefault();

            var visit = new ApiVisit
            {
                Method = context.Request.Method,
                Path = context.Request.Path.HasValue ? context.Request.Path.Value : null,
                QueryString = context.Request.QueryString.HasValue ? context.Request.QueryString.Value : null,
                Endpoint = endpoint,
                StatusCode = context.Response?.StatusCode,
                DurationMs = (int)Math.Round(stopwatch.Elapsed.TotalMilliseconds),
                IpAddress = remoteIpAddress,
                ForwardedFor = forwardedFor,
                UserAgent = userAgent,
                Referrer = referrer,
                Host = context.Request.Host.HasValue ? context.Request.Host.Value : null,
                Scheme = context.Request.Scheme,
                Protocol = context.Request.Protocol,
                RequestId = context.TraceIdentifier,
                RequestSizeBytes = context.Request.ContentLength,
                UserId = currentUser?.IsAuthenticated == true ? currentUser.UserId : null,
                UserEmail = currentUser?.IsAuthenticated == true ? currentUser.Email : null,
                UserRole = currentUser?.IsAuthenticated == true ? currentUser.Role.ToString() : null
            };

            db.ApiVisits.Add(visit);
            await db.SaveChangesAsync(context.RequestAborted);

            MarkVisitRecordedToday(memoryCache, remoteIpAddress, currentUser, visitRecordedAtUtc);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                "Failed to store api visit",
                LoggerCategory,
                new
                {
                    request_path = context.Request.Path.Value,
                    trace_id = context.TraceIdentifier,
                    exception_type = ex.GetType().FullName,
                    exception_message = ex.Message,
                    stack_trace = ex.StackTrace
                });
        }
    }

    private static async Task<bool> HasVisitBeenRecordedTodayAsync(
        PlantourContext db,
        IMemoryCache memoryCache,
        System.Net.IPAddress? remoteIpAddress,
        CurrentUser? currentUser,
        DateTime utcNow,
        CancellationToken cancellationToken)
    {
        var cacheKey = BuildDailyVisitCacheKey(remoteIpAddress, currentUser, utcNow);

        if (cacheKey == null)
        {
            return false;
        }

        if (memoryCache.TryGetValue(cacheKey, out _))
        {
            return true;
        }

        var lockCacheKey = BuildDailyVisitLockCacheKey(cacheKey);
        var visitLock = memoryCache.GetOrCreate(lockCacheKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = GetRemainingUtcDayDuration(utcNow);
            return new SemaphoreSlim(1, 1);
        });

        if (visitLock == null)
        {
            return false;
        }

        await visitLock.WaitAsync(cancellationToken);

        try
        {
            if (memoryCache.TryGetValue(cacheKey, out _))
            {
                return true;
            }

            var dayStartUtc = utcNow.Date;
            var nextDayUtc = dayStartUtc.AddDays(1);
            var isAuthenticated = currentUser?.IsAuthenticated == true;
            var currentUserId = currentUser?.UserId;

            var visitQuery = db.ApiVisits
                .AsNoTracking()
                .Where(visit => visit.CreatedAt >= dayStartUtc && visit.CreatedAt < nextDayUtc)
                .Where(visit => visit.IpAddress == remoteIpAddress);

            if (isAuthenticated && currentUserId.HasValue)
            {
                visitQuery = visitQuery.Where(visit => visit.UserId == currentUserId.Value);
            }
            else
            {
                visitQuery = visitQuery.Where(visit => visit.UserId == null);
            }

            var visitExists = await visitQuery.AnyAsync(cancellationToken);

            if (!visitExists)
            {
                return false;
            }

            MarkVisitRecordedToday(memoryCache, remoteIpAddress, currentUser, utcNow);
            return true;
        }
        finally
        {
            visitLock.Release();
        }
    }

    private static void MarkVisitRecordedToday(
        IMemoryCache memoryCache,
        System.Net.IPAddress? remoteIpAddress,
        CurrentUser? currentUser,
        DateTime utcNow)
    {
        var cacheKey = BuildDailyVisitCacheKey(remoteIpAddress, currentUser, utcNow);

        if (cacheKey == null)
        {
            return;
        }

        memoryCache.Set(cacheKey, true, GetRemainingUtcDayDuration(utcNow));
    }

    private static string? BuildDailyVisitCacheKey(
        System.Net.IPAddress? remoteIpAddress,
        CurrentUser? currentUser,
        DateTime utcNow)
    {
        if (remoteIpAddress == null)
        {
            return null;
        }

        var userKey = currentUser?.IsAuthenticated == true
            ? currentUser.UserId.ToString("N")
            : "anonymous";

        return $"{DailyVisitCacheKeyPrefix}:{utcNow:yyyyMMdd}:{remoteIpAddress}:{userKey}";
    }

    private static string BuildDailyVisitLockCacheKey(string visitCacheKey)
        => $"{DailyVisitLockCacheKeyPrefix}:{visitCacheKey}";

    private static TimeSpan GetRemainingUtcDayDuration(DateTime utcNow)
    {
        var remaining = utcNow.Date.AddDays(1) - utcNow;
        return remaining > TimeSpan.Zero ? remaining : TimeSpan.FromMinutes(1);
    }
}