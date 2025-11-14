using Microsoft.AspNetCore.Builder;

namespace Plantour.Infrastructure.Exceptions;

public static class ExceptionHandlingExtensions
{
    public static WebApplication UseCustomExceptionHandler(this WebApplication app)
    {
        app.UseMiddleware<ExceptionHandlingMiddleware>();
        return app;
    }
}