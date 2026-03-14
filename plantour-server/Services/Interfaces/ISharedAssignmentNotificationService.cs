using plantour_server.DbModels;

namespace plantour_server.Services.Interfaces;

public interface ISharedAssignmentNotificationService
{
    Task NotifyParticipantAssignmentChangesAsync(
        User admin,
        string tripName,
        Guid tripId,
        string entityLabel,
        string entityRoute,
        IEnumerable<ParticipantAssignmentEmailChange> changes);

    Task NotifyAdminParticipantActionAsync(
        User admin,
        User participant,
        string tripName,
        Guid tripId,
        string entityLabel,
        string entityName,
        string entityRoute,
        string actionLabel);
}

public record ParticipantAssignmentEmailChange(
    string RecipientEmail,
    string RecipientName,
    string ActionLabel,
    IReadOnlyList<string> EntityNames,
    DateTime? DeadlineAt);