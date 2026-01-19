using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
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

        (int statusCode, ErrorResponse response) = exception switch
        {
            CustomException x => (
                StatusCodes.Status400BadRequest,
                new ErrorResponse("custom_exception", x.Message)
            ),

            _ => (
                StatusCodes.Status500InternalServerError,
                new ErrorResponse("internal_error", "Unexpected server error")
            )
        };

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = MediaTypeNames.Application.Json;

        await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);

        return true;
    }
}

public record ErrorResponse(string Code, string Message);