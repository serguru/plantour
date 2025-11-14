namespace Plantour.Infrastructure.Dtos;

public class LoginRequest
{
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
}

public class SignUpRequest
{
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
    public Dictionary<string, object>? Metadata { get; set; }
}

public class MagicLinkRequest
{
    public string Email { get; set; } = default!;
}

public class ResetPasswordRequest
{
    public string Email { get; set; } = default!;
}

public class UpdateProfileRequest
{
    public Dictionary<string, object> NewMetadata { get; set; } = default!;
}
