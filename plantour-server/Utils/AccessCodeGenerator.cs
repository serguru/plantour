using System.Security.Cryptography;
using System.Text;

namespace plantour_server.Utils;

public static class AccessCodeGenerator
{
    private const string AllowedChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded similar chars: I, O, 0, 1

    /// <summary>
    /// Generates a random 8-character access code
    /// </summary>
    public static string Generate()
    {
        var code = new StringBuilder(8);
        var randomBytes = RandomNumberGenerator.GetBytes(8);

        for (int i = 0; i < 8; i++)
        {
            code.Append(AllowedChars[randomBytes[i] % AllowedChars.Length]);
        }

        return code.ToString();
    }

    /// <summary>
    /// Generates a unique access code that doesn't exist in the database
    /// </summary>
    public static async Task<string> GenerateUniqueAsync(Func<string, Task<bool>> existsCheck)
    {
        string code;
        int attempts = 0;
        const int maxAttempts = 100;

        do
        {
            code = Generate();
            attempts++;

            if (attempts > maxAttempts)
            {
                throw new InvalidOperationException("Failed to generate unique access code after multiple attempts");
            }
        }
        while (await existsCheck(code));

        return code;
    }
}