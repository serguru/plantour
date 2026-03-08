using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ISignInEmailService
{
    // Task<string> GenerateSignInTokenAsync(string email);
    // Task<string?> GetEmailFromSignInTokenAsync(string token);


    Task<SignInResponse> SendSignInEmailAsync(string email);

    string? GetEmailFromSignInToken(string token);

    // Task<bool> ConfirmEmailAsync(Guid userId, string token);

    // Task<bool> IsEmailConfirmedAsync(Guid userId);
    // Task SendSignInEmailAsync(User user);
}
