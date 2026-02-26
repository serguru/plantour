using plantour_server.Models;
using plantour_server.Utils;
using PlantourApi.Middleware;

namespace PlantourApi.Models;


public class CurrentUser
{
    public Guid UserId { get; set; }
    public Guid AdminId { get; set; }
    public UserRole? Role { get; set; }
    public string Email { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public byte[]? PasswordHash { get; set; }
    public byte[]? PasswordSalt { get; set; }
    public string? Phone { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid AccessTypeId { get; set; }
    public string? AccessTypeName { get; set; }
    public string? PaddleSubscriptionId { get; set; }
    public bool EmailConfirmed { get; set; }
    public bool IsAuthenticated => Role != null;
    public bool IsAdmin => Role == UserRole.Admin;
    public bool IsParticipant => Role == UserRole.Participant;

    public PlanPrice? PriceEnumId { get; set; }

    public List<AccessRule> AccessRules { get; set; } = new();

    public void RaiseIfNotAuthenticated()
    {
        if (!IsAuthenticated && (IsAdmin || IsParticipant))
        {
            throw new CustomException("User is not authenticated or the role is invalid");
        }
    }   
    public void RaiseIfNotAdmin()
    {
        if (!IsAdmin || !IsAuthenticated)
        {
            throw new CustomException("User is not admin");
        }
    }   
    public void RaiseIfNotParticipant()
    {
        if (!IsParticipant || !IsAuthenticated)
        {
            throw new CustomException("User is not participant");
        }
    }   
}