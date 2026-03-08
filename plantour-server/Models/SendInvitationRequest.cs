using plantour_server.DbModels;
using plantour_server.Utils;

namespace plantour_server.Models;

public class SendInvitationRequest
{
    public Guid AdminParticipantId { get; set; }
}
