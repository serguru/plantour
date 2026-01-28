namespace PlantourApi.Middleware;


public class BaseApiException : Exception
{
    public int StatusCode { get; }
    public string? Code { get; }

    public BaseApiException(string message, int statusCode, string? code = null) : base(message)
    {
        StatusCode = statusCode;
        Code = code;
    }
}

public class NotFoundException : BaseApiException
{
    public NotFoundException(string msg, string? code = null) : base(msg, 404, code) { }
}

public class UnauthorizedException : BaseApiException
{
    public UnauthorizedException(string msg, string? code = null) : base(msg, 401, code) { }
}

public class ForbiddenException : BaseApiException
{
    public ForbiddenException(string msg, string? code = null) : base(msg, 403, code) { }
}

public class CustomException : BaseApiException
{
    public CustomException(string msg, string? code = null) : base(msg, 501, code) { }
}
