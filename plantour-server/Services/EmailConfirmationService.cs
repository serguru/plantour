using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Options;
using plantour_server.DbModels;
using plantour_server.Models;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using plantour_server.Utils;
using PlantourApi.Middleware;

namespace plantour_server.Services;

public class EmailConfirmationService : IEmailConfirmationService
{
    private readonly ITimeLimitedDataProtector _protector;
    private readonly JwtSettings _jwtSettings;
    private readonly UserEmailConfirmationRepository _confirmationRepository;
    private readonly IBrevoEmailClient _emailClient;
    private readonly IConfiguration _configuration;

    private readonly UsersRepository _usersRepository;
    private readonly AccessTypeRepository _accessTypeRepository;

    public EmailConfirmationService(
        IDataProtectionProvider dataProtectionProvider,
        IOptions<JwtSettings> jwtSettings,
        UserEmailConfirmationRepository confirmationRepository,
        IBrevoEmailClient emailClient,
        UsersRepository usersRepository,
        AccessTypeRepository accessTypeRepository,
        IConfiguration configuration)
    {
        _protector = dataProtectionProvider.CreateProtector("Plantour.EmailConfirmation").ToTimeLimitedDataProtector();
        _jwtSettings = jwtSettings.Value;
        _confirmationRepository = confirmationRepository;
        _emailClient = emailClient;
        _configuration = configuration;
        _usersRepository = usersRepository;
        _accessTypeRepository = accessTypeRepository;
        
    }

    public Task<string> GenerateEmailConfirmationTokenAsync(User user, int emailConfirmationTokenMinutes)
    {
        var payload = $"{user.Id}|{user.Email}";
        var token = _protector.Protect(payload, TimeSpan.FromMinutes(emailConfirmationTokenMinutes));
        return Task.FromResult(token);
    }


    public async Task ResetUserRegistrationAsync(Guid userId)
    {
        User? user = await _usersRepository.GetByIdAsync(userId);
        if (user == null) 
        {
            return;
        }
        user.AccessTypeId = await _accessTypeRepository.GetActiveId();
        await _usersRepository.UpdateAsync(user);
        await _confirmationRepository.DeleteRangeAsync(x => x.UserId == userId);
    }

    public async Task ResetPendingAsync(Guid userId)
    {
        User? user = await _usersRepository.GetByIdAsync(userId);
        if (user == null) 
        {
            return;
        }
        user.AccessTypeId = await _accessTypeRepository.GetActiveId();
        await _usersRepository.UpdateAsync(user);
        await _confirmationRepository.DeleteRangeAsync(x => x.UserId == userId);
    }

    public async Task<bool> ConfirmEmailAsync(Guid userId, string token)
    {
        string payload;
        try
        {
            payload = _protector.Unprotect(token);
        }
        catch (CryptographicException ex)
        {
            if (ex.Message.Contains("expired", StringComparison.OrdinalIgnoreCase))
            {
            }
            await ResetUserRegistrationAsync(userId);
            return false;
        }

        var parts = payload.Split('|', 2);
        if (parts.Length != 2)
        {
            await ResetUserRegistrationAsync(userId);
            return false;
        }

        if (!Guid.TryParse(parts[0], out var tokenUserId))
        {
            await ResetUserRegistrationAsync(userId);
            return false;
        }

        if (tokenUserId != userId)
        {
            await ResetUserRegistrationAsync(userId);
            return false;
        }

        await ResetPendingAsync(userId);


        // var confirmation = await _confirmationRepository.GetByUserIdAsync(userId);
        // if (confirmation == null)
        // {
        //     // confirmation = new UserEmailConfirmation
        //     // {
        //     //     Id = Guid.NewGuid(),
        //     //     UserId = userId,
        //     //     CreatedAt = DateTime.UtcNow,
        //     //     ConfirmedAt = DateTime.UtcNow
        //     // };
        //     // await _confirmationRepository.AddAsync(confirmation);
        //     return true;
        // }

        // if (confirmation.ConfirmedAt == null)
        // {

        //     await _confirmationRepository.DeleteRangeAsync(x => x.UserId == userId);
        //     // confirmation.ConfirmedAt = DateTime.UtcNow;
        //     // await _confirmationRepository.UpdateAsync(confirmation);
        // }

        return true;
    }

    public async Task<bool> IsEmailConfirmedAsync(Guid userId)
    {
        var confirmation = await _confirmationRepository.GetByUserIdAsync(userId);
        return confirmation?.ConfirmedAt != null;
    }

    // TODO: clean email confirmation rows in DB
    public async Task SendConfirmationEmailAsync(User user)
    {
        var baseUrl = _configuration["EmailConfirmation:BaseUrl"];
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            throw new CustomException("EmailConfirmation:BaseUrl is not configured");
        }

        var emailConfirmationTokenMinutes = _jwtSettings.EmailConfirmationTokenMinutes;
        var expiresAt = DateTime.UtcNow.AddMinutes(emailConfirmationTokenMinutes);
        var token = await GenerateEmailConfirmationTokenAsync(user, emailConfirmationTokenMinutes);

        var confirmationUrl = $"{baseUrl}?userId={Uri.EscapeDataString(user.Id.ToString())}&token={Uri.EscapeDataString(token)}";

        string toName = Misc.GenerateFullName(user.FirstName, user.LastName);

        string greeting = string.IsNullOrWhiteSpace(toName) ? "<p>Hello,</p>" : $"<p>Hello {toName},</p>";

        var subject = "Confirm your Plantour email";
        var html = greeting + $@"
    <p>Welcome to Plantour!</p>
    <p>Please confirm your email by clicking the link below:</p>
    <p><a href=""{confirmationUrl}"">Confirm email</a></p>
    <p>If you did not create this account, ignore this email.</p>";

        await _emailClient.SendTransactionalEmailAsync(
        user.Email,
            $"{user.FirstName} {user.LastName}".Trim(),
            subject,
            html);

        var confirmation = await _confirmationRepository.GetByUserIdAsync(user.Id);
        if (confirmation == null)
        {
            confirmation = new UserEmailConfirmation
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow,
                LastSentAt = DateTime.UtcNow,
                ExpiresAt = expiresAt
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
