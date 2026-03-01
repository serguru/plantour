using System.Text.Json.Serialization;

namespace plantour_server.DTOs;

public class TokenRequestDto
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
};
public class AuthResponseDto 
{ 
    public required string AccessToken { get; set; } 
    public required string RefreshToken { get; set; } 
};
