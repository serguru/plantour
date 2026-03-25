using System.Diagnostics;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using plantour_server.DbModels;
using plantour_server.Repositories;
using PlantourApi.Models;

namespace PlantourApi.Middleware;

public class ApiVisitLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ApiVisitLoggingMiddleware> _logger;

    public ApiVisitLoggingMiddleware(RequestDelegate next, ILogger<ApiVisitLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    // public List<string> GetNoLogPaths()
    // {
    //     object? setting = GetSettingByKey("exclude_paths_from_log") ?? throw new CustomException("exclude_paths_from_log setting not found");
    //     string s = (string)setting;
    //     List<string> result = [.. s.Split(";")];
    //     return result;
    // }


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
            var currentUser = context.Items["CurrentUser"] as CurrentUser;

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
                IpAddress = context.Connection.RemoteIpAddress,
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
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to store api visit");
        }
    }
}