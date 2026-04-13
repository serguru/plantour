using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using plantour_server.Logging;
using System.Net.Mime;

namespace PlantourApi.Middleware;

public class GlobalExceptionHandler(IPlantourLogger logger) : IExceptionHandler
{
    private const string LoggerCategory = nameof(GlobalExceptionHandler);

    private readonly IPlantourLogger _logger = logger;

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var requestMethod = httpContext.Request.Method;
        var requestPath = httpContext.Request.Path.Value;
        int statusCode;
        string code;
        string? message = null;

        if (exception is BaseApiException baseApiException)
        {
            statusCode = baseApiException.StatusCode;
            code = baseApiException.Code ?? "BASE_API_EXCEPTION";
        }
        else if (exception is DbUpdateException dbUpdateException)
        {
            statusCode = StatusCodes.Status500InternalServerError;
            code = "DB_ERROR";
            var dbMessage = dbUpdateException.InnerException?.Data?["MessageText"]?.ToString();

            if (!string.IsNullOrWhiteSpace(dbMessage))
            {
                message = dbMessage;
            }
        }
        else
        {
            statusCode = StatusCodes.Status500InternalServerError;
            code = "INTERNAL_SERVER_ERROR";
        }

        if (statusCode >= StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(
                exception,
                $"Unhandled exception for {requestMethod} {requestPath}. StatusCode: {statusCode}, Code: {code}, TraceId: {httpContext.TraceIdentifier}",
                LoggerCategory,
                new
                {
                    request_method = requestMethod,
                    request_path = requestPath,
                    status_code = statusCode,
                    code,
                    trace_id = httpContext.TraceIdentifier
                });
        }
        else
        {
            _logger.LogWarning(
                exception,
                $"Handled exception for {requestMethod} {requestPath}. StatusCode: {statusCode}, Code: {code}, TraceId: {httpContext.TraceIdentifier}",
                LoggerCategory,
                new
                {
                    request_method = requestMethod,
                    request_path = requestPath,
                    status_code = statusCode,
                    code,
                    trace_id = httpContext.TraceIdentifier
                });
        }

        var response = new ApiErrorResponse
        {
            StatusCode = statusCode,
            Message = string.IsNullOrWhiteSpace(message) ? exception.Message : message,
            Code = code,
            Instance = $"{requestMethod} {requestPath}",
            IsCustom = exception is BaseApiException || exception is DbUpdateException
        };

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = MediaTypeNames.Application.Json;

        await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);

        return true;
    }
}
