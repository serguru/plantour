using System.Security.Cryptography;
using System.Text;

namespace plantour_server.Utils;

public class AccessCodeGenerator
{
    public AccessCodeGenerator(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    private readonly IConfiguration _configuration;

    private const string AllowedChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded similar chars: I, O, 0, 1

    /// <summary>
    /// Generates a random 8-character access code
    /// </summary>
    public string GenerateAccessCode()
    {
        var code = new StringBuilder(8);
        var randomBytes = RandomNumberGenerator.GetBytes(8);

        for (int i = 0; i < 8; i++)
        {
            code.Append(AllowedChars[randomBytes[i] % AllowedChars.Length]);
        }

        return code.ToString();
    }

    public string AccessCode2Hash(string accessCode)
    {
        string? pepper = _configuration["AccessCodePepper"];

        if (string.IsNullOrWhiteSpace(accessCode))
            throw new ArgumentException("AccessCode must not be empty", nameof(accessCode));

        if (string.IsNullOrWhiteSpace(pepper))
            throw new ArgumentException("Pepper must not be empty", nameof(pepper));

        string input = accessCode + pepper;
        byte[] bytes = Encoding.UTF8.GetBytes(input);
        byte[] hashBytes = SHA256.HashData(bytes);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }
}