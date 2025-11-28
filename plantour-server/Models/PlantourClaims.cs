namespace plantour_server.Models;

public static class PlantourClaims
{
    public const string UserId = "user_id";
    public const string Email = "email";
    public const string FirstName = "first_name";
    public const string LastName = "last_name";
    public const string Role = "role";
    public const string AdminId = "admin_id";
    public const string ParticipantId = "participant_id";
    public const string AccessCode = "access_code";
}

public static class PlantourRoles
{
    public const string Admin = "Admin";
    public const string Participant = "Participant";
}