using plantour_server.DTOs;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using PlantourApi.Middleware;
using PlantourApi.Models;
using plantour_server.DbModels;

namespace plantour_server.Services;

public class InvitationService(
    InvitationsRepository invitationsRepository,
    AdminsParticipantRepository adminsParticipantRepository,
    IEmailService emailService,
    HttpCurrentUser httpCurrentUser,
    SettingsRepository settingsRepository
    ) : IInvitationService
{
    private readonly InvitationsRepository _invitationsRepository = invitationsRepository;
    private readonly AdminsParticipantRepository _adminsParticipantRepository = adminsParticipantRepository;
    private readonly IEmailService _emailService = emailService;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly SettingsRepository _settingsRepository = settingsRepository;


    public async Task<SendInvitationEmailResponse> SendInvitationEmailByIdAsync(Guid adminParticipantId, string accessCode, AuthResponse authResponse)
    {
        var baseUrl = _settingsRepository.GetSettingByKey("plantour_app_origin").Result.ToString() ?? throw new CustomException("Plantour app origin is not configured");
        

        var adminParticipant = await _adminsParticipantRepository.GetByIdAsync(adminParticipantId);

        if (adminParticipant == null)
        {
            throw new CustomException("Admin participant not found");
        }

        if (adminParticipant.Participant.AccessType.Name != "Active")
        {
            throw new CustomException("Cannot send invitation to a participant with non-active access type");
        }

        var accessUrl = $"{baseUrl}/dashboard?accessToken={Uri.EscapeDataString(authResponse.AccessToken)}&refreshToken={authResponse.RefreshToken}";

        var participantFullName = string.Join(' ', new[] { adminParticipant.Participant.FirstName, adminParticipant.Participant.LastName }.Where(x => !string.IsNullOrWhiteSpace(x)));

        var adminFullName = string.Join(' ', new[] { adminParticipant.Admin.FirstName, adminParticipant.Admin.LastName }.Where(x => !string.IsNullOrWhiteSpace(x)));

        var signInUrl = $"{baseUrl}/sign-in/participant";

        var emailResult = await _emailService.SendInvitationEmailAsync(new InvitationEmailRequest(
            adminParticipant.Participant.Email,
            participantFullName,
            adminFullName,
            accessUrl,
            signInUrl,
            accessCode));

        var now = DateTime.UtcNow;

        var invitation = new Invitation
        {
            Id = Guid.NewGuid(),
            AdminParticipantId = adminParticipantId,
            AccessCode = accessCode,
            FirstName = adminParticipant.Participant.FirstName,
            LastName = adminParticipant.Participant.LastName,
            Email = adminParticipant.Participant.Email,
            Phone = adminParticipant.Participant.Phone,
            Subject = emailResult.Subject,
            Message = emailResult.HtmlContent
        };

        await _invitationsRepository.AddAsync(invitation);

        return new SendInvitationEmailResponse
        {
            InvitationId = invitation.Id,
            SentAt = invitation.SentAt ?? now,
            ProviderMessageId = emailResult.ProviderMessageId
        };
    }

}

