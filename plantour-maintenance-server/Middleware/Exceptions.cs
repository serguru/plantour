namespace plantour_maintenance_server.Middleware;

public class BaseApiException : Exception
{
    public int StatusCode { get; }
    public string? Code { get; }

    protected BaseApiException(string message, int statusCode, string? code = null) : base(message)
    {
        StatusCode = statusCode;
        Code = code;
    }
}

public class NotFoundException(string message, string? code = null) : BaseApiException(message, StatusCodes.Status404NotFound, code);

public class BadRequestException(string message, string? code = null) : BaseApiException(message, StatusCodes.Status400BadRequest, code);

public class UnauthorizedException(string message, string? code = null) : BaseApiException(message, StatusCodes.Status401Unauthorized, code);

public class CustomException(string message, string? code = null) : BaseApiException(message, StatusCodes.Status500InternalServerError, code);