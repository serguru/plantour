using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlantourApi.Middleware;
using System.Net.Mime;

public class GlobalExceptionHandler : IExceptionHandler
{
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

        // TODO LOG
        // Log exception details here if application logging is re-enabled.

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
