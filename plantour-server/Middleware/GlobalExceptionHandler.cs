using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using plantour_server.Models;
using plantour_server.Services.Interfaces;
using PlantourApi.Middleware;
using Serilog;
using Serilog.Context;
using System.Net;
using System.Net.Mime;
using System.Text;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IBrevoEmailClient _emailClient;
    private readonly BrevoSettings _brevoSettings;

    public GlobalExceptionHandler(
        ILogger<GlobalExceptionHandler> logger,
        IBrevoEmailClient emailClient,
        IOptions<BrevoSettings> brevoSettings)
    {
        _logger = logger;
        _emailClient = emailClient;
        _brevoSettings = brevoSettings.Value;
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

            if (statusCode != StatusCodes.Status401Unauthorized)
            {
                var traceId = httpContext.TraceIdentifier;
                await TrySendExceptionEmailAsync(
                    exception,
                    statusCode,
                    traceId,
                    requestMethod,
                    requestPath,
                    requestQueryString,
                    remoteIpAddress,
                    userId,
                    userRole);
            }

            var response = new ApiErrorResponse
            {
                StatusCode = statusCode,
                Message = exception.Message,
                Code = code,
                Instance = $"{httpContext.Request.Method} {httpContext.Request.Path}",
                IsCustom = exception is BaseApiException
            };

            httpContext.Response.StatusCode = statusCode;
            httpContext.Response.ContentType = MediaTypeNames.Application.Json;

            await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);

            return true;
        }
    }

    private async Task TrySendExceptionEmailAsync(
        Exception exception,
        int statusCode,
        string traceId,
        string requestMethod,
        string? requestPath,
        string? requestQueryString,
        string remoteIpAddress,
        string userId,
        string userRole)
    {
        if (string.IsNullOrWhiteSpace(_brevoSettings.ExceptionsReceiverEmail)
            || string.IsNullOrWhiteSpace(_brevoSettings.ExceptionsReceiverName))
        {
            return;
        }

        try
        {
            string Encode(string? value) => WebUtility.HtmlEncode(value ?? string.Empty);

            var subject = $"Plantour API exception ({statusCode})";

            var htmlBuilder = new StringBuilder();
            htmlBuilder.AppendLine("<h2>Plantour API Exception</h2>");
            htmlBuilder.AppendLine($"<p><strong>Trace ID:</strong> {Encode(traceId)}</p>");
            htmlBuilder.AppendLine($"<p><strong>Status Code:</strong> {statusCode}</p>");
            htmlBuilder.AppendLine($"<p><strong>Request:</strong> {Encode(requestMethod)} {Encode(requestPath)}</p>");
            if (!string.IsNullOrWhiteSpace(requestQueryString))
            {
                htmlBuilder.AppendLine($"<p><strong>Query:</strong> {Encode(requestQueryString)}</p>");
            }
            htmlBuilder.AppendLine($"<p><strong>Remote IP:</strong> {Encode(remoteIpAddress)}</p>");
            htmlBuilder.AppendLine($"<p><strong>User:</strong> {Encode(userId)} ({Encode(userRole)})</p>");
            htmlBuilder.AppendLine($"<p><strong>Exception Type:</strong> {Encode(exception.GetType().FullName)}</p>");
            htmlBuilder.AppendLine($"<p><strong>Message:</strong> {Encode(exception.Message)}</p>");

            if (exception.InnerException != null)
            {
                htmlBuilder.AppendLine($"<p><strong>Inner Exception:</strong> {Encode(exception.InnerException.GetType().FullName)}</p>");
                htmlBuilder.AppendLine($"<p><strong>Inner Message:</strong> {Encode(exception.InnerException.Message)}</p>");
            }

            if (!string.IsNullOrWhiteSpace(exception.StackTrace))
            {
                htmlBuilder.AppendLine("<p><strong>Stack Trace:</strong></p>");
                htmlBuilder.AppendLine($"<pre>{Encode(exception.StackTrace)}</pre>");
            }

            await _emailClient.SendTransactionalEmailAsync(
                _brevoSettings.ExceptionsReceiverEmail,
                _brevoSettings.ExceptionsReceiverName,
                subject,
                htmlBuilder.ToString());
        }
        catch (Exception emailException)
        {
            _logger.LogError(emailException, "Failed to send exception email notification");
        }
    }
}
