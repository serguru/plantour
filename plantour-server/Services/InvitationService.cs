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
    HttpCurrentUser httpCurrentUser) : IInvitationService
{
    private readonly InvitationsRepository _invitationsRepository = invitationsRepository;
    private readonly AdminsParticipantRepository _adminsParticipantRepository = adminsParticipantRepository;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly IConfiguration _configuration = configuration;
    private readonly IBrevoEmailClient _brevoEmailClient = brevoEmailClient;
    private readonly IAdminsParticipantService _adminsParticipantService = adminsParticipantService;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;


    public async Task<SendInvitationEmailResponse> SendInvitationEmailByIdAsync(Guid adminParticipantId, string accessCode, string accessToken, string refreshToken)
    {
        var baseUrl = _configuration["PlantourAppOrigin"];
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            throw new CustomException("PlantourAppOrigin is not configured");
        }

        var adminParticipant = await _adminsParticipantRepository.GetByIdAsync(adminParticipantId);

        if (adminParticipant == null)
        {
            throw new CustomException("Admin participant not found");
        }

        if (adminParticipant.Participant.AccessType.Name != "Active")
        {
            throw new CustomException("Cannot send invitation to a participant with non-active access type");
        }

        var accessUrl = $"{baseUrl}?accessToken={Uri.EscapeDataString(accessToken)}&refreshToken={Uri.EscapeDataString(refreshToken)}";


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
            <p><a href=""{accessUrl}/sign-in"">Sign In</a></p>
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




    public async Task<SendInvitationEmailResponse> SendInvitationEmailAsync(SendInvitationEmailRequest request)
    {


        // Subject = "You're invited to join Plantour!",
        // Message = $"Hello {request.FirstName},\n\nYou've been invited to join Plantour by {_currentUser.FirstName} {_currentUser.LastName}. Please use the following access code to sign in:\n\n{accessCode}\n\nBest regards,\nThe Plantour Team",
        // ExpiresAt = DateTime.UtcNow.AddDays(7),
        // CommunicationType = "email",
        // Notes = $"Invitation sent by admin {_currentUser.Email} on {DateTime.UtcNow}"


        _currentUser.RaiseIfNotAdmin();

        if (request.ExpiresAt <= DateTime.UtcNow)
        {
            throw new CustomException("Invitation expires_at must be in the future");
        }

        var adminParicipant = await _adminsParticipantRepository.FindAsync(x =>
            x.AdminId == _currentUser.UserId &&
            x.Participant.Email.ToLower() == request.Email.ToLower()).ContinueWith(task => task.Result.FirstOrDefault());

        if (adminParicipant == null)
        {
            throw new CustomException("The admin participant with the specified email not found");
        }

        if (adminParicipant.Participant.AccessType.Name != "Active")
        {
            throw new CustomException("Cannot send invitation to a participant with non-active access type");
        }

        if (request.AccessCode == null)
        {
            var accessCodeResult = await _adminsParticipantService.GenerateAccessCodeAsync();
            request.AccessCode = accessCodeResult.Item1;
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
            AdminParticipantId = adminParicipant!.Id,
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

