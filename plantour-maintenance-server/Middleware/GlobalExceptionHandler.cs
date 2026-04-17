using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using plantour_maintenance_server.Models;

namespace plantour_maintenance_server.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var requestMethod = httpContext.Request.Method;
        var requestPath = httpContext.Request.Path.Value;

        var (statusCode, code, message, isCustom) = exception switch
        {
            BaseApiException baseApiException => (baseApiException.StatusCode, baseApiException.Code ?? "BASE_API_EXCEPTION", baseApiException.Message, true),
            DbUpdateException dbUpdateException => (StatusCodes.Status500InternalServerError, "DB_ERROR", dbUpdateException.InnerException?.Data?["MessageText"]?.ToString() ?? dbUpdateException.Message, true),
            _ => (StatusCodes.Status500InternalServerError, "INTERNAL_SERVER_ERROR", exception.Message, false)
        };

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