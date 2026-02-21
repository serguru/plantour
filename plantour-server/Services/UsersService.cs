// AccessCode hash helpers (same as password)
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;
using Google.Apis.Auth;
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
    HttpCurrentUser httpCurrentUser,
    AccessCodeGenerator accessCodeGenerator,
    IHttpClientFactory httpClientFactory,
    IOptions<SocialAuthSettings> socialAuthSettings) : IUsersService
{
    private readonly AccessCodeGenerator _accessCodeGenerator = accessCodeGenerator;
    private readonly UsersRepository _usersRepository = usersRepository;
    private readonly AdminsParticipantRepository _adminsParticipantRepository = adminsParticipantRepository;
    private readonly PlanRepository _planRepository = planRepository;
    private readonly SettingsRepository _settingsRepository = settingsRepository;
    private readonly AccessTypeRepository _accessTypeRepository = accessTypeRepository;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly IInvitationService _invitationService = invitationService;
    private readonly IAdminsParticipantService _adminsParticipantService = adminsParticipantService;
    private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
    private readonly SocialAuthSettings _socialAuthSettings = socialAuthSettings.Value;

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

    public async Task<AuthResponse> SignInAdminSocialAsync(SocialSignInRequest request)
    {
        var provider = request.Provider.Trim().ToLowerInvariant();

        return provider switch
        {
            "google" => await SignInWithGoogleAsync(request.GoogleIdToken),
            "facebook" => await SignInWithFacebookAsync(request.FacebookAccessToken),
            _ => throw new CustomException("Unsupported social provider")
        };
    }

    // TODO: ensure social login works from a phone
    public async Task<UserDto> LinkSocialProviderAsync(SocialSignInRequest request)
    {
        var provider = request.Provider.Trim().ToLowerInvariant();

        var user = await _usersRepository.GetByIdAsync(_currentUser.UserId);
        if (user == null)
        {
            throw new CustomException("User not found");
        }

        switch (provider)
        {
            case "google":
            {
                var identity = await VerifyGoogleTokenAsync(request.GoogleIdToken);
                var existing = await _usersRepository.GetByGoogleSubAsync(identity.ProviderUserId);
                if (existing != null && existing.Id != user.Id)
                {
                    throw new CustomException("This Google account is already linked to another Plantour account");
                }

                user.GoogleSub = identity.ProviderUserId;

                if (string.IsNullOrWhiteSpace(user.FirstName) && !string.IsNullOrWhiteSpace(identity.FirstName))
                {
                    user.FirstName = identity.FirstName;
                }

                if (string.IsNullOrWhiteSpace(user.LastName) && !string.IsNullOrWhiteSpace(identity.LastName))
                {
                    user.LastName = identity.LastName;
                }

                break;
            }
            case "facebook":
            {
                var identity = await VerifyFacebookTokenAsync(request.FacebookAccessToken);
                var existing = await _usersRepository.GetByFacebookUserIdAsync(identity.ProviderUserId);
                if (existing != null && existing.Id != user.Id)
                {
                    throw new CustomException("This Facebook account is already linked to another Plantour account");
                }

                user.FacebookUserId = identity.ProviderUserId;

                if (string.IsNullOrWhiteSpace(user.FirstName) && !string.IsNullOrWhiteSpace(identity.FirstName))
                {
                    user.FirstName = identity.FirstName;
                }

                if (string.IsNullOrWhiteSpace(user.LastName) && !string.IsNullOrWhiteSpace(identity.LastName))
                {
                    user.LastName = identity.LastName;
                }

                break;
            }
            default:
                throw new CustomException("Unsupported social provider");
        }

        await _usersRepository.UpdateAsync(user);
        return MapUserDto(user);
    }

    public async Task<UserDto> UnlinkSocialProviderAsync(string provider)
    {
        var normalizedProvider = provider.Trim().ToLowerInvariant();

        var user = await _usersRepository.GetByIdAsync(_currentUser.UserId);
        if (user == null)
        {
            throw new CustomException("User not found");
        }

        var hasPassword = user.PasswordHash != null && user.PasswordSalt != null;

        switch (normalizedProvider)
        {
            case "google":
                if (string.IsNullOrWhiteSpace(user.GoogleSub))
                {
                    return MapUserDto(user);
                }

                if (!hasPassword && string.IsNullOrWhiteSpace(user.FacebookUserId))
                {
                    throw new CustomException("Cannot disconnect Google login. Set a password or link Facebook first.");
                }

                user.GoogleSub = null;
                break;
            case "facebook":
                if (string.IsNullOrWhiteSpace(user.FacebookUserId))
                {
                    return MapUserDto(user);
                }

                if (!hasPassword && string.IsNullOrWhiteSpace(user.GoogleSub))
                {
                    throw new CustomException("Cannot disconnect Facebook login. Set a password or link Google first.");
                }

                user.FacebookUserId = null;
                break;
            default:
                throw new CustomException("Unsupported social provider");
        }

        await _usersRepository.UpdateAsync(user);
        return MapUserDto(user);
    }

    #endregion

    #region Participant Authentication

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
        var hash = _accessCodeGenerator.AccessCode2Hash(request.AccessCode);

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

        return MapUserDto(user);
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

        return MapUserDto(user);
    }

    public async Task UpdatePasswordAsync(UpdatePasswordRequest request)
    {
        var user = await _usersRepository.GetByIdAsync(_currentUser.UserId);
        if (user == null)
        {
            throw new CustomException("User not found");
        }

        if (user.PasswordHash != null && user.PasswordSalt != null)
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            {
                throw new CustomException("Current password is required");
            }

            if (!VerifyPasswordHash(request.CurrentPassword, user.PasswordHash, user.PasswordSalt))
            {
                throw new UnauthorizedException("Current password is incorrect");
            }
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
        var plans = await _planRepository.GetAll();
        plans = plans.Where(p => p.Public!.Value).ToList();

        var result = new LandingDto()
        {
            Plans = _mapper.Map<List<PlanDto>>(plans),
            
            GuestPlanDurationDays = (int)await _settingsRepository.GetSettingByKey("guest_plan_duration_days") + " days"
        };
        return result; 
    }

    private async Task<AuthResponse> SignInWithGoogleAsync(string? googleIdToken)
    {
        var identity = await VerifyGoogleTokenAsync(googleIdToken);

        var user = await ResolveOrCreateSocialUserAsync(
            email: identity.Email,
            firstName: identity.FirstName,
            lastName: identity.LastName,
            provider: "google",
            providerUserId: identity.ProviderUserId);

        return await CreateAuthResponseAsync(user, UserRole.Admin, user.Id, null, "Welcome to Plantour");
    }

    private async Task<AuthResponse> SignInWithFacebookAsync(string? facebookAccessToken)
    {
        var identity = await VerifyFacebookTokenAsync(facebookAccessToken);

        var user = await ResolveOrCreateSocialUserAsync(
            email: identity.Email,
            firstName: identity.FirstName,
            lastName: identity.LastName,
            provider: "facebook",
            providerUserId: identity.ProviderUserId);

        return await CreateAuthResponseAsync(user, UserRole.Admin, user.Id, null, "Welcome to Plantour");
    }

    private async Task<SocialIdentity> VerifyGoogleTokenAsync(string? googleIdToken)
    {
        if (string.IsNullOrWhiteSpace(_socialAuthSettings.GoogleClientId))
        {
            throw new CustomException("Google login is not configured on server");
        }

        if (string.IsNullOrWhiteSpace(googleIdToken))
        {
            throw new CustomException("Google ID token is required");
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(googleIdToken, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [_socialAuthSettings.GoogleClientId]
            });
        }
        catch
        {
            throw new UnauthorizedException("Google token is invalid", "NO_ACCESS");
        }

        if (string.IsNullOrWhiteSpace(payload.Email) || string.IsNullOrWhiteSpace(payload.Subject))
        {
            throw new CustomException("Google account identity is unavailable");
        }

        return new SocialIdentity(payload.Email, payload.Subject, payload.GivenName, payload.FamilyName);
    }

    private async Task<SocialIdentity> VerifyFacebookTokenAsync(string? facebookAccessToken)
    {
        if (string.IsNullOrWhiteSpace(_socialAuthSettings.FacebookAppId) || string.IsNullOrWhiteSpace(_socialAuthSettings.FacebookAppSecret))
        {
            throw new CustomException("Facebook login is not configured on server");
        }

        if (string.IsNullOrWhiteSpace(facebookAccessToken))
        {
            throw new CustomException("Facebook access token is required");
        }

        var appAccessToken = $"{_socialAuthSettings.FacebookAppId}|{_socialAuthSettings.FacebookAppSecret}";
        var httpClient = _httpClientFactory.CreateClient();

        var debugResponse = await httpClient.GetFromJsonAsync<FacebookDebugResponse>(
            $"https://graph.facebook.com/debug_token?input_token={Uri.EscapeDataString(facebookAccessToken)}&access_token={Uri.EscapeDataString(appAccessToken)}");

        if (debugResponse?.Data == null
            || !debugResponse.Data.IsValid
            || !string.Equals(debugResponse.Data.AppId, _socialAuthSettings.FacebookAppId, StringComparison.Ordinal)
            || string.IsNullOrWhiteSpace(debugResponse.Data.UserId))
        {
            throw new UnauthorizedException("Facebook token is invalid", "NO_ACCESS");
        }

        var profile = await httpClient.GetFromJsonAsync<FacebookMeResponse>(
            $"https://graph.facebook.com/me?fields=id,email,first_name,last_name&access_token={Uri.EscapeDataString(facebookAccessToken)}");

        if (profile == null || string.IsNullOrWhiteSpace(profile.Id))
        {
            throw new UnauthorizedException("Facebook profile is unavailable", "NO_ACCESS");
        }

        if (!string.Equals(profile.Id, debugResponse.Data.UserId, StringComparison.Ordinal))
        {
            throw new UnauthorizedException("Facebook token does not match profile", "NO_ACCESS");
        }

        if (string.IsNullOrWhiteSpace(profile.Email))
        {
            throw new CustomException("Facebook account email is unavailable. Please allow email permission and try again.");
        }

        return new SocialIdentity(profile.Email, profile.Id, profile.FirstName, profile.LastName);
    }

    private async Task<User> ResolveOrCreateSocialUserAsync(string email, string? firstName, string? lastName, string provider, string providerUserId)
    {
        User? linkedUser = provider == "google"
            ? await _usersRepository.GetByGoogleSubAsync(providerUserId)
            : await _usersRepository.GetByFacebookUserIdAsync(providerUserId);

        if (linkedUser != null)
        {
            EnsureUserCanSignIn(linkedUser);
            return linkedUser;
        }

        var emailUser = await _usersRepository.GetByEmailAsync(email);
        if (emailUser != null)
        {
            if (provider == "google")
            {
                emailUser.GoogleSub = providerUserId;
            }
            else
            {
                emailUser.FacebookUserId = providerUserId;
            }

            if (string.IsNullOrWhiteSpace(emailUser.FirstName) && !string.IsNullOrWhiteSpace(firstName))
            {
                emailUser.FirstName = firstName;
            }

            if (string.IsNullOrWhiteSpace(emailUser.LastName) && !string.IsNullOrWhiteSpace(lastName))
            {
                emailUser.LastName = lastName;
            }

            if (string.Equals(emailUser.AccessType?.Name, "Pending", StringComparison.OrdinalIgnoreCase))
            {
                emailUser.AccessTypeId = await _accessTypeRepository.GetActiveId();
            }

            await _usersRepository.UpdateAsync(emailUser);
            EnsureUserCanSignIn(emailUser);
            return emailUser;
        }

        var newUser = new User
        {
            Email = email,
            PasswordHash = null,
            PasswordSalt = null,
            FirstName = firstName,
            LastName = lastName,
            AccessTypeId = await _accessTypeRepository.GetActiveId(),
            PlanId = await _planRepository.GetNoPlanId(),
            GoogleSub = provider == "google" ? providerUserId : null,
            FacebookUserId = provider == "facebook" ? providerUserId : null
        };

        await _usersRepository.AddAsync(newUser);

        var created = await _usersRepository.GetByEmailAsync(email);
        if (created == null)
        {
            throw new CustomException("Failed to create social account");
        }

        return created;
    }

    private void EnsureUserCanSignIn(User user)
    {
        var accessTypeName = user.AccessType?.Name;

        if (string.Equals(accessTypeName, "Active", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        throw new ForbiddenException(GetAccessStatusMessage(accessTypeName), "NO_ACCESS");
    }

    private static UserDto MapUserDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Phone = user.Phone,
            Notes = user.Notes,
            HasPassword = user.PasswordHash != null && user.PasswordSalt != null,
            HasGoogleLinked = !string.IsNullOrWhiteSpace(user.GoogleSub),
            HasFacebookLinked = !string.IsNullOrWhiteSpace(user.FacebookUserId)
        };
    }

    private sealed record SocialIdentity(string Email, string ProviderUserId, string? FirstName, string? LastName);

    private sealed class FacebookDebugResponse
    {
        public FacebookDebugData? Data { get; set; }
    }

    private sealed class FacebookDebugData
    {
        [JsonPropertyName("app_id")]
        public string? AppId { get; set; }

        [JsonPropertyName("is_valid")]
        public bool IsValid { get; set; }

        [JsonPropertyName("user_id")]
        public string? UserId { get; set; }
    }

    private sealed class FacebookMeResponse
    {
        public string? Id { get; set; }
        public string? Email { get; set; }

        [JsonPropertyName("first_name")]
        public string? FirstName { get; set; }

        [JsonPropertyName("last_name")]
        public string? LastName { get; set; }
    }
}

