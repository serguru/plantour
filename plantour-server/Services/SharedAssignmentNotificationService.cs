using plantour_server.DbModels;
using plantour_server.Logging;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using plantour_server.Utils;

namespace plantour_server.Services;

public class SharedAssignmentNotificationService(
    IEmailService emailService,
    SettingsRepository settingsRepository,
    IPlantourLogger logger) : ISharedAssignmentNotificationService
{
    private readonly IEmailService _emailService = emailService;
    private readonly SettingsRepository _settingsRepository = settingsRepository;
    private readonly IPlantourLogger _logger = logger;

    public async Task NotifyParticipantAssignmentChangesAsync(
        User admin,
        string tripName,
        Guid tripId,
        string entityLabel,
        string entityRoute,
        IEnumerable<ParticipantAssignmentEmailChange> changes)
    {
        var changesList = changes
            .Where(x => !string.IsNullOrWhiteSpace(x.RecipientEmail) && x.EntityNames.Count > 0)
            .ToList();

        if (changesList.Count == 0)
        {
            return;
        }

        var baseUrl = await GetBaseUrlSafeAsync();
        var adminName = GetDisplayName(admin.FirstName, admin.LastName, admin.Email);

        foreach (var change in changesList)
        {
            try
            {
                var pageUrl = $"{baseUrl}/trips/{tripId}/{entityRoute}";
                var greetingName = string.IsNullOrWhiteSpace(change.RecipientName) ? change.RecipientEmail : change.RecipientName;

                await _emailService.SendParticipantAssignmentChangesEmailAsync(new ParticipantAssignmentChangesEmailRequest(
                    change.RecipientEmail,
                    greetingName,
                    adminName,
                    tripName,
                    entityLabel,
                    change.ActionLabel,
                    change.EntityNames,
                    change.DeadlineAt,
                    pageUrl));
            }
            catch (Exception)
            {
                _logger.LogWarning($"Failed to send participant assignment notification email for trip {tripId}");
            }
        }
    }

    public async Task NotifyAdminParticipantActionAsync(
        User admin,
        User participant,
        string tripName,
        Guid tripId,
        string entityLabel,
        string entityName,
        string entityRoute,
        string actionLabel)
    {
        if (string.IsNullOrWhiteSpace(admin.Email))
        {
            return;
        }

        try
        {
            var baseUrl = await GetBaseUrlSafeAsync();
            var adminName = GetDisplayName(admin.FirstName, admin.LastName, admin.Email);
            var participantName = GetDisplayName(participant.FirstName, participant.LastName, participant.Email);
            var pageUrl = $"{baseUrl}/trips/{tripId}/{entityRoute}";

            await _emailService.SendAdminParticipantActionEmailAsync(new AdminParticipantActionEmailRequest(
                admin.Email,
                adminName,
                participantName,
                tripName,
                entityLabel,
                entityName,
                actionLabel,
                pageUrl));
        }
        catch (Exception)
        {
            _logger.LogWarning($"Failed to send admin participant action notification email for trip {tripId}");
        }
    }

    private async Task<string> GetBaseUrlSafeAsync()
    {
        var value = await _settingsRepository.GetSettingByKey("plantour_app_origin");
        var baseUrl = value?.ToString()?.TrimEnd('/');

        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return string.Empty;
        }

        return baseUrl;
    }

    private static string GetDisplayName(string? firstName, string? lastName, string email)
    {
        var fullName = Misc.GenerateFullName(firstName, lastName);
        return string.IsNullOrWhiteSpace(fullName) ? email : fullName;
    }
}