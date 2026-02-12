using plantour_server.DTOs;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using PlantourApi.Middleware;
using PlantourApi.Models;
using plantour_server.DbModels;

namespace plantour_server.Services;

public class InvitationService(
    InvitationsRepository invitationsRepository,
    ICheckAccessService checkAccessService,
    IBrevoEmailClient brevoEmailClient,
    HttpCurrentUser httpCurrentUser) : IInvitationService
{
    private readonly InvitationsRepository _invitationsRepository = invitationsRepository;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly IBrevoEmailClient _brevoEmailClient = brevoEmailClient;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;

    public async Task<SendInvitationEmailResponse> SendInvitationEmailAsync(SendInvitationEmailRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.HasAdminAccessToTripAsync(request.TripId, _currentUser.UserId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        if (request.ExpiresAt <= DateTime.UtcNow)
        {
            throw new CustomException("Invitation expires_at must be in the future");
        }

        var sendResult = await _brevoEmailClient.SendTransactionalEmailAsync(
            request.Email,
            string.Join(' ', new[] { request.FirstName, request.LastName }.Where(x => !string.IsNullOrWhiteSpace(x))),
            request.Subject,
            request.Message,
            request.Message);

        var now = DateTime.UtcNow;

        var invitation = new Invitation
        {
            Id = Guid.NewGuid(),
            TripId = request.TripId,
            AccessCode = request.AccessCode,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            Subject = request.Subject,
            Message = request.Message,
            CreatedAt = now,
            ExpiresAt = request.ExpiresAt,
            SentAt = now,
            CommunicationType = string.IsNullOrWhiteSpace(request.CommunicationType) ? "email" : request.CommunicationType,
            Notes = request.Notes
        };

        await _invitationsRepository.AddAsync(invitation);

        return new SendInvitationEmailResponse
        {
            InvitationId = invitation.Id,
            SentAt = invitation.SentAt ?? now,
            ProviderMessageId = sendResult.MessageId
        };
    }
}
