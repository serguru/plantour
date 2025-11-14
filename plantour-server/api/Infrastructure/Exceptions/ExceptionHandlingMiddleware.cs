using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;

namespace Plantour.Infrastructure.Exceptions;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _env;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            var traceId = context.TraceIdentifier;
            _logger.LogError(ex, "Unhandled exception (TraceId: {TraceId})", traceId);

            if (context.Response.HasStarted)
            {
                _logger.LogWarning("Response has already started for TraceId: {TraceId}. Cannot modify response.", traceId);
                throw;
            }

            context.Response.Clear();
            context.Response.StatusCode = ex switch
            {
                UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
                KeyNotFoundException => StatusCodes.Status404NotFound,
                ArgumentException => StatusCodes.Status400BadRequest,
                _ => StatusCodes.Status500InternalServerError
            };
            context.Response.ContentType = "application/json";

            var payload = new
            {
                traceId,
                message = _env.IsDevelopment() ? ex.Message : "An unexpected error occurred.",
                detail = _env.IsDevelopment() ? ex.StackTrace : null
            };

            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var json = JsonSerializer.Serialize(payload, options);

            await context.Response.WriteAsync(json);
        }
    }
}