using System.Security.Cryptography;
using System.Text;

namespace Plantour.Utils;

public static class AccessCodeGenerator
{
    public static string GenerateParticipantCode(int length = 8)
    {
        const string chars =
            "abcdefghijklmnopqrstuvwxyz" +
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "0123456789" +
            "!@#$%^&*()-_=+[]{}:;,.?";

        var bytes = new byte[length];
        RandomNumberGenerator.Fill(bytes);

        var sb = new StringBuilder(length);
        for (int i = 0; i < length; i++)
        {
            sb.Append(chars[bytes[i] % chars.Length]);
        }

        return sb.ToString();
    }
}
