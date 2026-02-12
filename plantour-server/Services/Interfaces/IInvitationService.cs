using plantour_server.DTOs;

namespace plantour_server.Services.Interfaces;

public interface IInvitationService
{
    Task<SendInvitationEmailResponse> SendInvitationEmailAsync(SendInvitationEmailRequest request);
}
