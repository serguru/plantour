using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PlantourApi.Middleware;
using System.Net.Mime;
using Serilog;
using Serilog.Context;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        // Extract request information for contextual logging
        var requestMethod = httpContext.Request.Method;
        var requestPath = httpContext.Request.Path.Value;
        var requestQueryString = httpContext.Request.QueryString.Value;
        var remoteIpAddress = httpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        var userId = httpContext.User?.FindFirst("sub")?.Value ?? httpContext.User?.FindFirst("email")?.Value ?? "Anonymous";
        var userRole = httpContext.User?.FindFirst("role")?.Value ?? "Unknown";

        // Add context information to log scope
        using (LogContext.PushProperty("RequestMethod", requestMethod))
        using (LogContext.PushProperty("RequestPath", requestPath))
        using (LogContext.PushProperty("QueryString", requestQueryString))
        using (LogContext.PushProperty("RemoteIpAddress", remoteIpAddress))
        using (LogContext.PushProperty("UserId", userId))
        using (LogContext.PushProperty("UserRole", userRole))
        {
            int statusCode;
            string code;

            if (exception is BaseApiException baseApiException)
            {
                statusCode = baseApiException.StatusCode;
                code = baseApiException.Code ?? "BASE_API_EXCEPTION";

                // Log business exceptions with appropriate log level
                if (statusCode >= 500)
                {
                    _logger.LogError(exception,
                        "Business exception (HTTP {StatusCode}): {ExceptionCode}. Request: {Method} {Path}. User: {UserId}",
                        statusCode, code, requestMethod, requestPath, userId);
                }
                else
                {
                    _logger.LogWarning(exception,
                        "Business exception (HTTP {StatusCode}): {ExceptionCode}. Request: {Method} {Path}. User: {UserId}",
                        statusCode, code, requestMethod, requestPath, userId);
                }
            }
            else
            {
                statusCode = StatusCodes.Status500InternalServerError;
                code = "INTERNAL_SERVER_ERROR";

                // Log unhandled exceptions as errors
                _logger.LogError(exception,
                    "Unhandled exception: {Message}. Request: {Method} {Path}. User: {UserId} ({UserRole}) from {IpAddress}",
                    exception.Message, requestMethod, requestPath, userId, userRole, remoteIpAddress);

                // Log additional details for debugging
                _logger.LogError("Exception Type: {ExceptionType}, Stack Trace: {StackTrace}",
                    exception.GetType().FullName, exception.StackTrace);
            }

            var response = new ApiErrorResponse
            {
                StatusCode = statusCode,
                Message = exception.Message,
                Code = code,
                Instance = $"{httpContext.Request.Method} {httpContext.Request.Path}"
            };

            httpContext.Response.StatusCode = statusCode;
            httpContext.Response.ContentType = MediaTypeNames.Application.Json;

            await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);

            return true;
        }
    }
}
