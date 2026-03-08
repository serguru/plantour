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
    ICheckAccessService checkAccessService,
    IBrevoEmailClient brevoEmailClient,
    IAdminsParticipantService adminsParticipantService,
    IConfiguration configuration,
    HttpCurrentUser httpCurrentUser,
    SettingsRepository settingsRepository
    ) : IInvitationService
{
    private readonly InvitationsRepository _invitationsRepository = invitationsRepository;
    private readonly AdminsParticipantRepository _adminsParticipantRepository = adminsParticipantRepository;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly IConfiguration _configuration = configuration;
    private readonly IBrevoEmailClient _brevoEmailClient = brevoEmailClient;
    private readonly IAdminsParticipantService _adminsParticipantService = adminsParticipantService;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly SettingsRepository _settingsRepository = settingsRepository;


    public async Task<SendInvitationEmailResponse> SendInvitationEmailByIdAsync(Guid adminParticipantId, string accessCode, string accessToken)
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

        var accessUrl = $"{baseUrl}/dashboard?accessToken={Uri.EscapeDataString(accessToken)}";

        var participantFullName = string.Join(' ', new[] { adminParticipant.Participant.FirstName, adminParticipant.Participant.LastName }.Where(x => !string.IsNullOrWhiteSpace(x)));

        var adminFullName = string.Join(' ', new[] { adminParticipant.Admin.FirstName, adminParticipant.Admin.LastName }.Where(x => !string.IsNullOrWhiteSpace(x)));

        var subject = "Your Plantour invitation";

        var html = $@"
            <p>Hello {participantFullName},</p>
            <p>Welcome to Plantour!</p>
            <p>You've been invited to join Plantour by {adminFullName}.</p>
            <p>You can access Plantour by clicking the link below:</p>
            <p><a href=""{accessUrl}"">Access Plantour</a></p>
            <p>or navigate to the following URL:</p>
            <p><a href=""{baseUrl}/sign-in/participant?code={accessCode}"">Sign In</a></p>
            <p>select 'Sign in as participant'</p>
            <p>and enter the following access code: <strong>{accessCode}</strong></p>
            <p>If you do not know {adminFullName}, please ignore this email.</p>";


        var sendResult = await _brevoEmailClient.SendTransactionalEmailAsync(
            adminParticipant.Participant.Email,
            string.Join(' ', new[] { adminParticipant.Participant.FirstName, adminParticipant.Participant.LastName }.Where(x => !string.IsNullOrWhiteSpace(x))),
            subject,
            html,
            html);

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
            Subject = subject,
            Message = html
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

