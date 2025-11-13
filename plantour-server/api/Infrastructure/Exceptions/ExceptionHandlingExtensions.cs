using Microsoft.AspNetCore.Builder;

namespace pack_api.Infrastructure.Exceptions
{
    public static class ExceptionHandlingExtensions
    {
        public static WebApplication UseCustomExceptionHandler(this WebApplication app)
        {
            app.UseMiddleware<ExceptionHandlingMiddleware>();
            return app;
        }
    }
}