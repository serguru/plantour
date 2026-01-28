using plantour_server.DTOs;

namespace plantour_server.Services.Interfaces;

public interface IInvitationService
{
    Task<SendInvitationResponse> SendInvitationAsync(SendInvitationRequest request);
}
