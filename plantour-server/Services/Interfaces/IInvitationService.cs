using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Services.Interfaces;

public interface IInvitationService
{
    Task<SendInvitationEmailResponse> SendInvitationEmailByIdAsync(Guid adminParticipantId, string accessCode, string accessToken);
}
