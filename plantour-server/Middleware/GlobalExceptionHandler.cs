using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using plantour_server.Logging;
using System.Net.Mime;

namespace PlantourApi.Middleware;

public class GlobalExceptionHandler(IPlantourLogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    private readonly IPlantourLogger<GlobalExceptionHandler> _logger = logger;

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
                "Unhandled exception for {RequestMethod} {RequestPath}. StatusCode: {StatusCode}, Code: {Code}, TraceId: {TraceId}",
                requestMethod,
                requestPath,
                statusCode,
                code,
                httpContext.TraceIdentifier);
        }
        else
        {
            _logger.LogWarning(
                exception,
                "Handled exception for {RequestMethod} {RequestPath}. StatusCode: {StatusCode}, Code: {Code}, TraceId: {TraceId}",
                requestMethod,
                requestPath,
                statusCode,
                code,
                httpContext.TraceIdentifier);
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
