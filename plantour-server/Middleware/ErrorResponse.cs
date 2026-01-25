namespace PlantourApi.Middleware;

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
            Instance = $"{context.Request.Method} {context.Request.Path}"
        };

        await context.Response.WriteAsJsonAsync(response);
    }
}