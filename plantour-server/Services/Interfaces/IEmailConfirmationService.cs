using plantour_server.DbModels;

namespace plantour_server.Services;

public interface IEmailConfirmationService
{
    Task<string> GenerateEmailConfirmationTokenAsync(User user);
    Task<bool> ConfirmEmailAsync(Guid userId, string token);
    Task<bool> IsEmailConfirmedAsync(Guid userId);
    Task SendConfirmationEmailAsync(User user, string token, CancellationToken cancellationToken = default);
}
