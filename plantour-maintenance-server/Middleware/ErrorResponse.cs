using plantour_maintenance_server.Models;

namespace plantour_maintenance_server.Middleware;

public static class ErrorResponse
{
    public static async Task WriteErrorResponse(HttpContext context, int statusCode, string code, string message)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var response = new ApiErrorResponse
        {
            StatusCode = statusCode,
            Message = message,
            Code = code,
            Instance = $"{context.Request.Method} {context.Request.Path}",
            IsCustom = true
        };

        await context.Response.WriteAsJsonAsync(response);
    }
}