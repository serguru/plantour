using Microsoft.Extensions.Logging;
using plantour_server.DbModels;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using plantour_server.Utils;

namespace plantour_server.Services;

public class SharedAssignmentNotificationService(
    IBrevoEmailClient brevoEmailClient,
    SettingsRepository settingsRepository,
    ILogger<SharedAssignmentNotificationService> logger) : ISharedAssignmentNotificationService
{
    private readonly IBrevoEmailClient _brevoEmailClient = brevoEmailClient;
    private readonly SettingsRepository _settingsRepository = settingsRepository;
    private readonly ILogger<SharedAssignmentNotificationService> _logger = logger;

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
                var subject = $"Plantour: {entityLabel} {change.ActionLabel} for {tripName}";
                var pageUrl = $"{baseUrl}/trips/{tripId}/{entityRoute}";
                var listItems = string.Join(string.Empty, change.EntityNames.Select(name => $"<li>{System.Net.WebUtility.HtmlEncode(name)}</li>"));
                var greetingName = string.IsNullOrWhiteSpace(change.RecipientName) ? change.RecipientEmail : change.RecipientName;
                var deadlineText = change.DeadlineAt.HasValue
                    ? $"<p>Deadline: <strong>{change.DeadlineAt.Value:yyyy-MM-dd HH:mm} UTC</strong></p>"
                    : string.Empty;

                var html = $@"
                    <p>Hello {System.Net.WebUtility.HtmlEncode(greetingName)},</p>
                    <p>{System.Net.WebUtility.HtmlEncode(adminName)} {change.ActionLabel.ToLowerInvariant()} the following {entityLabel} for the trip <strong>{System.Net.WebUtility.HtmlEncode(tripName)}</strong>:</p>
                    <ul>{listItems}</ul>
                    {deadlineText}
                    <p><a href=""{pageUrl}"">Open {entityLabel} in Plantour</a></p>";

                var text = $"Hello {greetingName},\n\n{adminName} {change.ActionLabel.ToLowerInvariant()} the following {entityLabel} for the trip {tripName}:\n - {string.Join("\n - ", change.EntityNames)}\n{(change.DeadlineAt.HasValue ? $"Deadline: {change.DeadlineAt.Value:yyyy-MM-dd HH:mm} UTC\n" : string.Empty)}\nOpen in Plantour: {pageUrl}";

                await _brevoEmailClient.SendTransactionalEmailAsync(
                    change.RecipientEmail,
                    greetingName,
                    subject,
                    html,
                    text);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send participant assignment notification email for trip {TripId}", tripId);
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
            var subject = $"Plantour: {participantName} {actionLabel.ToLowerInvariant()} a {entityLabel}";

            var html = $@"
                <p>Hello {System.Net.WebUtility.HtmlEncode(adminName)},</p>
                <p>{System.Net.WebUtility.HtmlEncode(participantName)} {actionLabel.ToLowerInvariant()} the {entityLabel} <strong>{System.Net.WebUtility.HtmlEncode(entityName)}</strong> in trip <strong>{System.Net.WebUtility.HtmlEncode(tripName)}</strong>.</p>
                <p><a href=""{pageUrl}"">Open {entityLabel} in Plantour</a></p>";

            var text = $"Hello {adminName},\n\n{participantName} {actionLabel.ToLowerInvariant()} the {entityLabel} '{entityName}' in trip {tripName}.\n\nOpen in Plantour: {pageUrl}";

            await _brevoEmailClient.SendTransactionalEmailAsync(
                admin.Email,
                adminName,
                subject,
                html,
                text);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send admin participant action notification email for trip {TripId}", tripId);
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