// AccessCode hash helpers (same as password)
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.DbModels;
using plantour_server.Utils;
using AutoMapper;
using PlantourApi.Models;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using plantour_server.Services.Interfaces;

namespace plantour_server.Services;

public class UsersService(
    IOptions<JwtSettings> jwtSettings,
    IMapper mapper,
    UsersRepository usersRepository,
    AdminsParticipantRepository adminsParticipantRepository,
    IAdminsParticipantService adminsParticipantService,
    PlanRepository planRepository,
    SettingsRepository settingsRepository,
    AccessTypeRepository accessTypeRepository,
    ITokenService tokenService,
    IRefreshTokenService refreshTokenService,
    IEmailConfirmationService emailConfirmationService,
    UserEmailConfirmationRepository userEmailConfirmationRepository,
    IConfiguration configuration,
    IWebHostEnvironment environment,
    IInvitationService invitationService,
    HttpCurrentUser httpCurrentUser) : IUsersService
{
    private readonly UsersRepository _usersRepository = usersRepository;
    private readonly AdminsParticipantRepository _adminsParticipantRepository = adminsParticipantRepository;
    private readonly PlanRepository _planRepository = planRepository;
    private readonly SettingsRepository _settingsRepository = settingsRepository;
    private readonly AccessTypeRepository _accessTypeRepository = accessTypeRepository;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly IInvitationService _invitationService = invitationService;
    private readonly IAdminsParticipantService _adminsParticipantService = adminsParticipantService;

    private readonly IMapper _mapper = mapper;
    private readonly JwtSettings _jwtSettings = jwtSettings.Value;
    private readonly ITokenService _tokenService = tokenService;
    private readonly IRefreshTokenService _refreshTokenService = refreshTokenService;
    private readonly IEmailConfirmationService _emailConfirmationService = emailConfirmationService;
    private readonly UserEmailConfirmationRepository _userEmailConfirmationRepository = userEmailConfirmationRepository;
    private readonly IConfiguration _configuration = configuration;
    private readonly IWebHostEnvironment _environment = environment;

    #region Admin Authentication

    public async Task<AuthResponse> SignUpAsync(SignUpRequest request)
    {
        // Check if user already exists
        if (await _usersRepository.GetByEmailAsync(request.Email) != null)
        {
            throw new CustomException("User with this email already exists");
        }

        // Create password hash
        CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);

        // Create new user
        var user = new User
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            AccessTypeId = await _accessTypeRepository.GetPendingId(),
            PlanId = await _planRepository.GetNoPlanId()
        };

        await _usersRepository.AddAsync(user);

        var emailToken = await _emailConfirmationService.GenerateEmailConfirmationTokenAsync(user);
        await _emailConfirmationService.SendConfirmationEmailAsync(user, emailToken);

        return new AuthResponse
        {
            AccessToken = string.Empty,
            RefreshToken = string.Empty,
            AccessTokenExpiresAtUtc = DateTime.MinValue,
            EmailConfirmationRequired = true,
            StatusCode = 200,
            Code = "EMAIL_CONFIRMATION_REQUIRED",
            Message = "Please confirm your email address."
        };
    }

    public async Task<AuthResponse> SignInAsync(SignInRequest request)
    {
        // Find user
        var user = await _usersRepository.GetByEmailAsync(request.Email);

        if (user == null || user.PasswordHash == null || user.PasswordSalt == null)
        {
            throw new UnauthorizedException("Wrong email or password", "NO_ACCESS");
        }

        // Verify password
        if (!VerifyPasswordHash(request.Password, user.PasswordHash, user.PasswordSalt))
        {
            throw new UnauthorizedException("Wrong email or password", "NO_ACCESS");
        }

        var accessTypeName = user.AccessType?.Name;
        if (string.Equals(accessTypeName, "Active", StringComparison.OrdinalIgnoreCase))
        {
            return await CreateAuthResponseAsync(user, UserRole.Admin, user.Id, null, "Welcome back to Plantour");
        }

        if (string.Equals(accessTypeName, "Pending", StringComparison.OrdinalIgnoreCase))
        {
            var confirmation = await _userEmailConfirmationRepository.GetByUserIdAsync(user.Id);

            if (confirmation == null)
            {
                var token = await _emailConfirmationService.GenerateEmailConfirmationTokenAsync(user);
                await _emailConfirmationService.SendConfirmationEmailAsync(user, token);
                throw new ForbiddenException("Please go to the email we sent to you and click on the link to confirm your email address", "NO_ACCESS");
            }

            if (confirmation.ConfirmedAt == null)
            {
                throw new ForbiddenException("Please go to the email we sent to you and click on the link to confirm your email address", "NO_ACCESS");
            }

            user.AccessTypeId = await _accessTypeRepository.GetActiveId();
            await _usersRepository.UpdateAsync(user);

            return await CreateAuthResponseAsync(user, UserRole.Admin, user.Id, null, "Welcome to Plantour");
        }

        throw new ForbiddenException(GetAccessStatusMessage(accessTypeName), "NO_ACCESS");
    }

    #endregion

    #region Participant Authentication

    private string AccessCode2Hash(string accessCode)
    {
        string? pepper = _configuration["AccessCodePepper"];

        if (string.IsNullOrWhiteSpace(accessCode))
            throw new ArgumentException("AccessCode must not be empty", nameof(accessCode));

        if (string.IsNullOrWhiteSpace(pepper))
            throw new ArgumentException("Pepper must not be empty", nameof(pepper));

        string input = accessCode + pepper;
        byte[] bytes = Encoding.UTF8.GetBytes(input);
        byte[] hashBytes = SHA256.HashData(bytes);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    public async Task<AdminsParticipantDto> SignUpParticipantAsync(SignUpParticipantRequest request)
    {
        _currentUser.RaiseIfNotAdmin();
        var users = await _usersRepository.FindAsync(x => x.Email.ToLower() == request.Email.ToLower());
        var participant = users.FirstOrDefault();

        // Ensure participant user exists or create new
        if (participant == null)
        {
            participant = new User
            {
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                PasswordHash = null,
                PasswordSalt = null,
                Notes = $"Registered by admin {_currentUser.Email} on {DateTime.UtcNow}",
                AccessTypeId = await _accessTypeRepository.GetActiveId(),
                PlanId = await _planRepository.GetNoPlanId()
            };
            await _usersRepository.AddAsync(participant);
        }

        if (await _adminsParticipantRepository.AnyAsync(x => x.AdminId == _currentUser.AdminId && x.ParticipantId == participant.Id))
        {
            throw new CustomException("Participant with this email is already registered under your admin account");
        }

        Tuple<string, string> accessCodeResult = await _adminsParticipantService.GenerateAccessCodeAsync();

        string accessCode = accessCodeResult.Item1;
        string accessCodeHash = accessCodeResult.Item2;

        // In development, we store the access code in the notes for easy retrieval
        string? notes = _environment.IsDevelopment()
            ? accessCode!
            : request.Notes;

        // Create admin-participant relationship
        var adminParticipant = new AdminsParticipant
        {
            Id = Guid.NewGuid(),
            AdminId = _currentUser.AdminId,
            ParticipantId = participant.Id,
            AccessCodeHash = accessCodeHash,
            Notes = notes
        };

        await _adminsParticipantRepository.AddAsync(adminParticipant);

        var r = await CreateAuthResponseAsync(participant, UserRole.Participant, _currentUser.AdminId, null, "Welcome to Plantour");

        await _invitationService.SendInvitationEmailByIdAsync(adminParticipant.Id, accessCode, r.AccessToken, r.RefreshToken);

         var baseUrl = _configuration["InvitationAccess:BaseUrl"];

        AdminsParticipantDto result = _mapper.Map<AdminsParticipantDto>(adminParticipant);

        return result;
    }

    public async Task<AuthResponse> SignInParticipantAsync(SignInParticipantRequest request)
    {
        var hash = AccessCode2Hash(request.AccessCode);

        var adminParticipants = await _adminsParticipantRepository
            .FindFullAsync(x => x.AccessCodeHash == hash);

        var adminParticipant = adminParticipants.FirstOrDefault();

        if (adminParticipant == null)
        {
            throw new UnauthorizedException("You have no access to Plantour. Please ask your Administartor to re-send the invitation email to you", "NO_ACCESS");
        }

        var participant = adminParticipant.Participant;
        var admin = adminParticipant.Admin;

        var participantAccessType = participant.AccessType?.Name;
        if (!string.Equals(participantAccessType, "Active", StringComparison.OrdinalIgnoreCase))
        {
            throw new ForbiddenException("The account suspended (or banned or archived or pending)", "NO_ACCESS");
        }

        return await CreateAuthResponseAsync(participant, UserRole.Participant, admin.Id, null, "Welcome back to Plantour");
    }

    #endregion

    #region Token Management


    public async Task<bool> ValidateTokenAsync(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request, string? ipAddress)
    {
        var storedToken = await _refreshTokenService.GetActiveTokenAsync(request.RefreshToken);
        if (storedToken == null)
        {
            var anyToken = await _refreshTokenService.GetTokenAsync(request.RefreshToken);
            if (anyToken != null && Enum.TryParse<UserRole>(anyToken.Role, out var tokenRole) && tokenRole == UserRole.Participant)
            {
                throw new UnauthorizedException("Please ask your Administartor to re-send the invitation email to you", "WRONG_PARTICIPANT_TOKEN");
            }

            throw new UnauthorizedException("Please sign in again", "WRONG_TOKEN");
        }

        var user = await _usersRepository.GetByIdWithDetailsAsync(storedToken.UserId);
        if (user == null)
        {
            throw new UnauthorizedException("User not found");
        }

        if (user.AccessType == null || !string.Equals(user.AccessType.Name, "Active", StringComparison.OrdinalIgnoreCase))
        {
            throw new ForbiddenException(GetAccessStatusMessage(user.AccessType?.Name), "NO_ACCESS");
        }

        if (!Enum.TryParse<UserRole>(storedToken.Role, out var role))
        {
            throw new UnauthorizedException("Invalid refresh token role");
        }

        var accessToken = _tokenService.CreateAccessToken(user, role, storedToken.AdminId);
        var newRefreshToken = _tokenService.CreateRefreshToken();

        await _refreshTokenService.RotateAsync(storedToken, newRefreshToken, ipAddress);

        return new AuthResponse
        {
            AccessToken = accessToken.Token,
            RefreshToken = newRefreshToken.Token,
            AccessTokenExpiresAtUtc = accessToken.ExpiresAtUtc,
            EmailConfirmationRequired = false,
            StatusCode = 200,
            Code = "ACCESS_OK",
            Message = "Access refreshed"
        };
    }

    public async Task RevokeRefreshTokenAsync(RevokeRefreshTokenRequest request, string? ipAddress)
    {
        await _refreshTokenService.RevokeAsync(request.RefreshToken, ipAddress);
    }

    public async Task SendEmailConfirmationAsync(ResendEmailConfirmationRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _usersRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            return;
        }

        if (await _emailConfirmationService.IsEmailConfirmedAsync(user.Id))
        {
            return;
        }

        var token = await _emailConfirmationService.GenerateEmailConfirmationTokenAsync(user);
        await _emailConfirmationService.SendConfirmationEmailAsync(user, token, cancellationToken);
    }

    public async Task<bool> ConfirmEmailAsync(ConfirmEmailRequest request)
    {
        return await _emailConfirmationService.ConfirmEmailAsync(request.UserId, request.Token);
    }

    #endregion

    #region Token Generation

    private async Task<AuthResponse> CreateAuthResponseAsync(User user, UserRole role, Guid adminId, string? ipAddress, string? message)
    {
        var accessToken = _tokenService.CreateAccessToken(user, role, adminId);
        var refreshToken = _tokenService.CreateRefreshToken();

        await _refreshTokenService.CreateAsync(user.Id, role, adminId, refreshToken, ipAddress);

        return new AuthResponse
        {
            AccessToken = accessToken.Token,
            RefreshToken = refreshToken.Token,
            AccessTokenExpiresAtUtc = accessToken.ExpiresAtUtc,
            EmailConfirmationRequired = false,
            StatusCode = 200,
            Code = "ACCESS_OK",
            Message = message ?? "Welcome back to Plantour"
        };
    }

    #endregion

    #region Password Helpers

    private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
    {
        using var hmac = new HMACSHA512();
        passwordSalt = hmac.Key;
        passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
    }

    private bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
    {
        using var hmac = new HMACSHA512(storedSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        return computedHash.SequenceEqual(storedHash);
    }

    #endregion

    private static string GetAccessStatusMessage(string? accessTypeName)
    {
        if (string.IsNullOrWhiteSpace(accessTypeName))
        {
            return "The account suspended";
        }

        return accessTypeName switch
        {
            "Suspended" => "The account suspended",
            "Banned" => "The account banned",
            "Archived" => "The account archived",
            _ => "The account suspended"
        };
    }

    #region Profile Management

    public async Task<UserDto> GetProfileAsync()
    {
        var user = await _usersRepository.GetByIdAsync(_currentUser.UserId);
        if (user == null)
        {
            throw new CustomException("User not found");
        }

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> UpdateProfileAsync(UpdateProfileRequest request)
    {
        var user = await _usersRepository.GetByIdAsync(_currentUser.UserId);
        if (user == null)
        {
            throw new CustomException("User not found");
        }

        // Check if email is being changed and if it already exists
        if (!string.IsNullOrWhiteSpace(request.Email) && !string.Equals(user.Email, request.Email, StringComparison.OrdinalIgnoreCase))
        {
            var existingUser = await _usersRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
            {
                throw new CustomException("This email is already in use by another account");
            }
            user.Email = request.Email;
        }

        // Update other fields if provided
        if (request.FirstName != null)
        {
            user.FirstName = request.FirstName;
        }

        if (request.LastName != null)
        {
            user.LastName = request.LastName;
        }

        if (request.Phone != null)
        {
            user.Phone = request.Phone;
        }

        await _usersRepository.UpdateAsync(user);

        return _mapper.Map<UserDto>(user);
    }

    public async Task UpdatePasswordAsync(UpdatePasswordRequest request)
    {
        var user = await _usersRepository.GetByIdAsync(_currentUser.UserId);
        if (user == null)
        {
            throw new CustomException("User not found");
        }

        if (user.PasswordHash == null || user.PasswordSalt == null)
        {
            throw new CustomException("Cannot update password for this account type");
        }

        // Verify current password
        if (!VerifyPasswordHash(request.CurrentPassword, user.PasswordHash, user.PasswordSalt))
        {
            throw new UnauthorizedException("Current password is incorrect");
        }

        // Create new password hash
        CreatePasswordHash(request.NewPassword, out byte[] passwordHash, out byte[] passwordSalt);
        user.PasswordHash = passwordHash;
        user.PasswordSalt = passwordSalt;

        await _usersRepository.UpdateAsync(user);
    }

    #endregion

    public async Task<LandingDto> GetLandingAsync()
    {
        int basePlanMonthly = (int)await _settingsRepository.GetSettingByKey("base_plan_monthly_cents");
        string basePlanMonthlyStr = (basePlanMonthly / 100.0).ToString("0.00");

        int proPlanMonthly = (int)await _settingsRepository.GetSettingByKey("pro_plan_monthly_cents");
        string proPlanMonthlyStr = (proPlanMonthly / 100.0).ToString("0.00");

        int basePlanYearly = (int)await _settingsRepository.GetSettingByKey("base_plan_yearly_cents");
        string basePlanYearlyStr = (basePlanYearly / 100.0).ToString("0.00");

        int proPlanYearly = (int)await _settingsRepository.GetSettingByKey("pro_plan_yearly_cents");
        string proPlanYearlyStr = (proPlanYearly / 100.0).ToString("0.00");

        int guestPlanDurationDays = (int)await _settingsRepository.GetSettingByKey("guest_plan_duration_days");
        string guestPlanDurationDaysStr = guestPlanDurationDays.ToString() + " days";

        return new LandingDto
        {
            GuestPlanName = (await this._settingsRepository.GetSettingByKey("guest_plan_name") as string)!,
            TrialPlanName = (await this._settingsRepository.GetSettingByKey("trial_plan_name") as string)!,
            BasePlanName = (await this._settingsRepository.GetSettingByKey("base_plan_name") as string)!,
            ProPlanName = (await this._settingsRepository.GetSettingByKey("pro_plan_name") as string)!,
            BasePlanMonthly = basePlanMonthlyStr,
            BasePlanYearly = basePlanYearlyStr,
            ProPlanMonthly = proPlanMonthlyStr,
            ProPlanYearly = proPlanYearlyStr,
            GuestPlanDurationDays = guestPlanDurationDaysStr
        };
    }
}

