namespace PlantourApi.Middleware;

public sealed record ErrorResponse(
    string Code,
    string Message
);