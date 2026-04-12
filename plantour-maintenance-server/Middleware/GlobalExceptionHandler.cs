using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using plantour_maintenance_server.Models;

namespace plantour_maintenance_server.Middleware;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger = logger;

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var requestMethod = httpContext.Request.Method;
        var requestPath = httpContext.Request.Path.Value;
        var userId = httpContext.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "Anonymous";

        var (statusCode, code, message, isCustom) = exception switch
        {
            BaseApiException baseApiException => (baseApiException.StatusCode, baseApiException.Code ?? "BASE_API_EXCEPTION", baseApiException.Message, true),
            DbUpdateException dbUpdateException => (StatusCodes.Status500InternalServerError, "DB_ERROR", dbUpdateException.InnerException?.Data?["MessageText"]?.ToString() ?? dbUpdateException.Message, true),
            _ => (StatusCodes.Status500InternalServerError, "INTERNAL_SERVER_ERROR", exception.Message, false)
        };

        if (statusCode >= 500)
        {
            _logger.LogError(exception, "Maintenance API exception {Code} on {Method} {Path} for {UserId}", code, requestMethod, requestPath, userId);
        }
        else
        {
            _logger.LogWarning(exception, "Maintenance API exception {Code} on {Method} {Path} for {UserId}", code, requestMethod, requestPath, userId);
        }

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/json";

        await httpContext.Response.WriteAsJsonAsync(new ApiErrorResponse
        {
            StatusCode = statusCode,
            Message = message,
            Code = code,
            Instance = $"{requestMethod} {requestPath}",
            IsCustom = isCustom
        }, cancellationToken);

        return true;
    }
}