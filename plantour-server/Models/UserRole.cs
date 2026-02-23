namespace PlantourApi.Models;

// TODO: if a user not Admin and not Participant they are not authenticated and should not have any role
public enum UserRole
{
    Participant = 1,
    Admin = 2
}