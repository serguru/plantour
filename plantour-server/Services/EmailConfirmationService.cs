using System.Text;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Options;
using plantour_server.DbModels;
using plantour_server.Models;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using PlantourApi.Middleware;

namespace plantour_server.Services;

public class EmailConfirmationService : IEmailConfirmationService
{
    private readonly ITimeLimitedDataProtector _protector;
    private readonly JwtSettings _jwtSettings;
    private readonly UserEmailConfirmationRepository _confirmationRepository;
    private readonly IBrevoEmailClient _emailClient;
    private readonly IConfiguration _configuration;

    public EmailConfirmationService(
        IDataProtectionProvider dataProtectionProvider,
        IOptions<JwtSettings> jwtSettings,
        UserEmailConfirmationRepository confirmationRepository,
        IBrevoEmailClient emailClient,
        IConfiguration configuration)
    {
        _protector = dataProtectionProvider.CreateProtector("Plantour.EmailConfirmation").ToTimeLimitedDataProtector();
        _jwtSettings = jwtSettings.Value;
        _confirmationRepository = confirmationRepository;
        _emailClient = emailClient;
        _configuration = configuration;
    }

    public Task<string> GenerateEmailConfirmationTokenAsync(User user)
    {
        var payload = $"{user.Id}|{user.Email}";
        var token = _protector.Protect(payload, TimeSpan.FromMinutes(_jwtSettings.EmailConfirmationTokenMinutes));
        return Task.FromResult(token);
    }

    public async Task<bool> ConfirmEmailAsync(Guid userId, string token)
    {
        string payload;
        try
        {
            payload = _protector.Unprotect(token, out var _);
        }
        catch
        {
            return false;
        }

        var parts = payload.Split('|', 2);
        if (parts.Length != 2)
        {
            return false;
        }

        if (!Guid.TryParse(parts[0], out var tokenUserId))
        {
            return false;
        }

        if (tokenUserId != userId)
        {
            return false;
        }

        var confirmation = await _confirmationRepository.GetByUserIdAsync(userId);
        if (confirmation == null)
        {
            confirmation = new UserEmailConfirmation
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                ConfirmedAt = DateTime.UtcNow
            };
            await _confirmationRepository.AddAsync(confirmation);
            return true;
        }

        if (confirmation.ConfirmedAt == null)
        {
            confirmation.ConfirmedAt = DateTime.UtcNow;
            await _confirmationRepository.UpdateAsync(confirmation);
        }

        return true;
    }

    public async Task<bool> IsEmailConfirmedAsync(Guid userId)
    {
        var confirmation = await _confirmationRepository.GetByUserIdAsync(userId);
        return confirmation?.ConfirmedAt != null;
    }

    public async Task SendConfirmationEmailAsync(User user, string token, CancellationToken cancellationToken = default)
    {
        var baseUrl = _configuration["EmailConfirmation:BaseUrl"];
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            throw new CustomException("EmailConfirmation:BaseUrl is not configured");
        }

        var confirmationUrl = $"{baseUrl}?userId={Uri.EscapeDataString(user.Id.ToString())}&token={Uri.EscapeDataString(token)}";

        var subject = "Confirm your Plantour email";
        var html = $@"
    <p>Welcome to Plantour!</p>
    <p>Please confirm your email by clicking the link below:</p>
    <p><a href=""{confirmationUrl}"">Confirm email</a></p>
    <p>If you did not create this account, ignore this email.</p>";

        await _emailClient.SendTransactionalEmailAsync(
        user.Email,
            $"{user.FirstName} {user.LastName}".Trim(),
            subject,
            html,
            cancellationToken: cancellationToken);

        var confirmation = await _confirmationRepository.GetByUserIdAsync(user.Id);
        if (confirmation == null)
        {
            confirmation = new UserEmailConfirmation
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow,
                LastSentAt = DateTime.UtcNow
            };
            await _confirmationRepository.AddAsync(confirmation);
        }
        else
        {
            confirmation.LastSentAt = DateTime.UtcNow;
            await _confirmationRepository.UpdateAsync(confirmation);
        }
    }
}
