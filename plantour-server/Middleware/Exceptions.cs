namespace PlantourApi.Middleware;

public sealed class CustomException : Exception
{
    public CustomException(string message) : base(message) { }
}

