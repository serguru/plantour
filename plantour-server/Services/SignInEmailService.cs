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

public class SignInEmailService : ISignInEmailService
{
    private readonly ITimeLimitedDataProtector _protector;
    private readonly JwtSettings _jwtSettings;
    private readonly IBrevoEmailClient _emailClient;
    private readonly IConfiguration _configuration;

    private readonly UsersRepository _usersRepository;
    private readonly AccessTypeRepository _accessTypeRepository;

    public SignInEmailService(
        IDataProtectionProvider dataProtectionProvider,
        IOptions<JwtSettings> jwtSettings,
        IBrevoEmailClient emailClient,
        UsersRepository usersRepository,
        AccessTypeRepository accessTypeRepository,
        IConfiguration configuration)
    {
        _protector = dataProtectionProvider.CreateProtector("Plantour.SignInEmail").ToTimeLimitedDataProtector();
        _jwtSettings = jwtSettings.Value;
        _emailClient = emailClient;
        _configuration = configuration;
        _usersRepository = usersRepository;
        _accessTypeRepository = accessTypeRepository;

    }

    private Task<string> GenerateSignInTokenAsync(string email)
    {
        if (String.IsNullOrWhiteSpace(email))
        {
            throw new CustomException("Unable to generate a sign-in token with the empty email");
        }

        var emailSignInTokenMinutes = _jwtSettings.SignInEmailTokenMinutes;
        if (emailSignInTokenMinutes <= 0)
        {
            throw new CustomException("SignInEmailTokenMinutes must be greater than 0");
        }

        var payload = email;
        var token = _protector.Protect(payload, TimeSpan.FromMinutes(emailSignInTokenMinutes));
        return Task.FromResult(token);
    }

    private async Task<string?> GetEmailFromSignInTokenAsync(string token)
    {
        string email;
        try
        {
            email = _protector.Unprotect(token);
        }
        catch (CryptographicException ex)
        {
            if (ex.Message.Contains("expired", StringComparison.OrdinalIgnoreCase))
            {
            }
            return null;
        }
        return email;
    }


    public async Task SendSignInEmailAsync(string email)
    {
        if (String.IsNullOrWhiteSpace(email))
        {
            throw new CustomException("Cannot send sign-in email to an empty email address");
        }
        string token = await GenerateSignInTokenAsync(email);

        string fullUserName = "";

        var user = await _usersRepository.GetByEmailAsync(email);
        if (user != null)
        {
            var accessType = await _accessTypeRepository.GetByIdAsync(user.AccessTypeId);
            if (accessType == null || accessType.Name != "Active")
            {
                throw new CustomException("User does not have an active access to Plantour");
            }
            fullUserName = Utils.Misc.GenerateFullName(user.FirstName, user.LastName);
        }
        fullUserName = String.IsNullOrWhiteSpace(fullUserName) ? "New Plantour User" : fullUserName;

        var baseUrl = _configuration["SignInEmail:BaseUrl"];
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            throw new CustomException("SignInEmail:BaseUrl is not configured");
        }

        var signInUrl = $"{baseUrl}?token={Uri.EscapeDataString(token)}";

        string greeting = $"<p>Hello {fullUserName},</p>";

        var subject = "Sign in to Plantour";
        var html = greeting + $@"
            <p>Welcome to Plantour!</p>
            <p>Please sign in to Plantour by clicking the link below:</p>
            <p><a href=""{signInUrl}"">Sign in</a></p>";

        try
        {
            await _emailClient.SendTransactionalEmailAsync(
                email,
                fullUserName,
                subject,
                html);
        }
        catch (Exception ex)
        {
            throw new CustomException($"Failed to send sign-in email with message: {ex.Message}");
        }   
    }
}
