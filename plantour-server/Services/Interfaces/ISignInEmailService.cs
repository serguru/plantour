using plantour_server.DbModels;

namespace plantour_server.Services;

public interface ISignInEmailService
{
    // Task<string> GenerateSignInTokenAsync(string email);
    // Task<string?> GetEmailFromSignInTokenAsync(string token);


    Task SendSignInEmailAsync(string email);

    // Task<bool> ConfirmEmailAsync(Guid userId, string token);

    // Task<bool> IsEmailConfirmedAsync(Guid userId);
    // Task SendSignInEmailAsync(User user);
}
