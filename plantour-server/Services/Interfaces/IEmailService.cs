namespace plantour_server.Services.Interfaces;

public interface IEmailService
{
    Task<EmailDispatchResult> SendSignInEmailAsync(SignInEmailRequest request);

    Task<EmailDispatchResult> SendInvitationEmailAsync(InvitationEmailRequest request);

    Task<EmailDispatchResult> SendContactSubmissionNotificationEmailAsync(ContactSubmissionNotificationEmailRequest request);

    Task<EmailDispatchResult> SendUserCreatedNotificationEmailAsync(UserCreatedNotificationEmailRequest request);

    Task<EmailDispatchResult> SendTripParticipantInvitationEmailAsync(TripParticipantInvitationEmailRequest request);

    Task<EmailDispatchResult> SendParticipantAssignmentChangesEmailAsync(ParticipantAssignmentChangesEmailRequest request);

    Task<EmailDispatchResult> SendAdminParticipantActionEmailAsync(AdminParticipantActionEmailRequest request);

    Task<EmailDispatchResult> SendExceptionAlertEmailAsync(ExceptionAlertEmailRequest request);
}

public record SignInEmailRequest(
    string RecipientEmail,
    string RecipientName,
    string SignInUrl,
    int ExpiresInMinutes);

public record InvitationEmailRequest(
    string RecipientEmail,
    string RecipientName,
    string AdminName,
    string AccessUrl,
    string SignInUrl,
    string AccessCode);

public record ContactSubmissionNotificationEmailRequest(
    string RecipientEmail,
    string RecipientName,
    string FullName,
    string Email,
    string? PhoneNumber,
    string? SubjectCategory,
    string MessageBody,
    DateTime SubmittedAt,
    string? IpAddress,
    string? UserAgent,
    string? ReferrerUrl);

public record UserCreatedNotificationEmailRequest(
    string RecipientEmail,
    string RecipientName,
    Guid UserId,
    string Email,
    string? FirstName,
    string? LastName,
    string? Phone,
    bool Temporary,
    string? AccessTypeName,
    DateTime CreatedAt,
    string? Notes,
    string? GoogleSub,
    string? FacebookUserId,
    string? ParticipantCode,
    string? PaymentProcessorSubscriptionId);

public record TripParticipantInvitationEmailRequest(
    string RecipientEmail,
    string RecipientName,
    string AdminName,
    string TripName,
    string TripUrl);

public record ParticipantAssignmentChangesEmailRequest(
    string RecipientEmail,
    string RecipientName,
    string AdminName,
    string TripName,
    string EntityLabel,
    string ActionLabel,
    IReadOnlyList<string> EntityNames,
    DateTime? DeadlineAt,
    string PageUrl);

public record AdminParticipantActionEmailRequest(
    string RecipientEmail,
    string RecipientName,
    string ParticipantName,
    string TripName,
    string EntityLabel,
    string EntityName,
    string ActionLabel,
    string PageUrl);

public record ExceptionAlertEmailRequest(
    string RecipientEmail,
    string RecipientName,
    int StatusCode,
    string TraceId,
    string RequestMethod,
    string? RequestPath,
    string? RequestQueryString,
    string RemoteIpAddress,
    string UserId,
    string UserRole,
    string ExceptionType,
    string ExceptionMessage,
    string? CustomMessage,
    string? InnerExceptionType,
    string? InnerExceptionMessage,
    string? StackTrace);

public record EmailDispatchResult(
    string Subject,
    string HtmlContent,
    string TextContent,
    string? ProviderMessageId);