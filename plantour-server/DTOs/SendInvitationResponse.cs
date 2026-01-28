namespace plantour_server.DTOs;

public class SendInvitationResponse
{
    public Guid InvitationId { get; set; }
    public DateTime SentAt { get; set; }
    public string? ProviderMessageId { get; set; }
}
