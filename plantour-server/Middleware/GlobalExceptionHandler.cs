using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PlantourApi.Middleware;
using System.Net.Mime;

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
        _logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);

        int statusCode;
        string code;

        if (exception is BaseApiException baseApiException)
        {
            statusCode = baseApiException.StatusCode;
            code = baseApiException.Code ?? "BASE_API_EXCEPTION";
        }
        else
        {
            statusCode = StatusCodes.Status500InternalServerError;
            code = "INTERNAL_SERVER_ERROR";
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
