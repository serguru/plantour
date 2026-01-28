namespace plantour_server.Services.Interfaces;

public record BrevoSendResult(string? MessageId);

public interface IBrevoEmailClient
{
    Task<BrevoSendResult> SendTransactionalEmailAsync(
        string toEmail,
        string? toName,
        string subject,
        string htmlContent,
        string? textContent = null,
        CancellationToken cancellationToken = default);
}
