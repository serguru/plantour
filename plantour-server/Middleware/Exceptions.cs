namespace PlantourApi.Middleware;


public class BaseApiException : Exception
{
    public int StatusCode { get; }
    public BaseApiException(string message, int statusCode) : base(message) => StatusCode = statusCode;
}

public class NotFoundException : BaseApiException
{
    public NotFoundException(string msg) : base(msg, 404) { }
}

public class UnauthorizedException : BaseApiException
{
    public UnauthorizedException(string msg) : base(msg, 401) { }
}

public class CustomException : BaseApiException
{
    public CustomException(string msg) : base(msg, 501) { }
}
