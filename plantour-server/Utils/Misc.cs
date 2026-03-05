namespace plantour_server.Utils;

public static class Misc
{
    public static string GenerateFullName(string? firstName, string? lastName)
    {
        // Combine the names, replacing nulls with empty strings
        string fullName = $"{firstName?.Trim()} {lastName?.Trim()}";

        // Trim the result to handle cases where one part is null/whitespace
        return fullName.Trim();
    }

}