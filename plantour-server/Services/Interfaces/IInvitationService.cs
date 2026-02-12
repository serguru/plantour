using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Services.Interfaces;

public interface IInvitationService
{
    Task<SendInvitationEmailResponse> SendInvitationEmailAsync(SendInvitationEmailRequest request);
    Task<SendInvitationEmailResponse> SendInvitationEmailByIdAsync(Guid adminParticipantId, string accessCode, string accessToken, string refreshToken);
}
