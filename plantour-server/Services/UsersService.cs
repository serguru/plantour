using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
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
using plantour_server.Services.TickerQ;
using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;

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
    IConfiguration configuration,
    IWebHostEnvironment environment,
    IInvitationService invitationService,
    HttpCurrentUser httpCurrentUser,
    AccessCodeGenerator accessCodeGenerator,
    IHttpClientFactory httpClientFactory,
    IAccessRulesService accessRulesService,
    RefreshTokenRepository refreshTokenRepository,
    TimeTickerRepository timeTickerRepository,
    IPaddleService paddleService,
    ISignInEmailService signInEmailService,
    IOptions<SocialAuthSettings> socialAuthSettings) : IUsersService
{
    private readonly AccessCodeGenerator _accessCodeGenerator = accessCodeGenerator;
    private readonly UsersRepository _usersRepository = usersRepository;
    private readonly RefreshTokenRepository _refreshTokenRepository = refreshTokenRepository;
    private readonly AdminsParticipantRepository _adminsParticipantRepository = adminsParticipantRepository;
    private readonly PlanRepository _planRepository = planRepository;
    private readonly SettingsRepository _settingsRepository = settingsRepository;
    private readonly AccessTypeRepository _accessTypeRepository = accessTypeRepository;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly IInvitationService _invitationService = invitationService;
    private readonly IAdminsParticipantService _adminsParticipantService = adminsParticipantService;
    private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
    private readonly SocialAuthSettings _socialAuthSettings = socialAuthSettings.Value;
    private readonly IAccessRulesService _accessRulesService = accessRulesService;
    private readonly IPaddleService _paddleService = paddleService;
    private readonly TimeTickerRepository _timeTickerRepository = timeTickerRepository;
    private readonly IMapper _mapper = mapper;
    private readonly JwtSettings _jwtSettings = jwtSettings.Value;
    private readonly ITokenService _tokenService = tokenService;
    private readonly IConfiguration _configuration = configuration;
    private readonly IWebHostEnvironment _environment = environment;
    private readonly ISignInEmailService _signInEmailService = signInEmailService;
    #region Admin Authentication

    public async Task<SignInResponse> SendSignInEmailAdminAsync(SignInRequest request)
    {
        return await _signInEmailService.SendSignInEmailAsync(request.Email);
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
    public async Task<AuthResponse> SignInAdminTokenAsync(string token)
    {
        string? email = _signInEmailService.GetEmailFromSignInToken(token);

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new UnauthorizedException("Invalid or expired sign-in token", "NO_ACCESS");
        }

        User? user = await _usersRepository.GetByEmailAsync(email);

        if (user == null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                Email = email,
                FirstName = null,
                LastName = null,
                CreatedAt = DateTime.UtcNow,
                Notes = null,
                AccessTypeId = await _accessTypeRepository.GetActiveId()
            };
            await _usersRepository.AddAsync(user);
        }

        EnsureActiveUser(user);

        return await CreateAuthResponseAsync(user, UserRole.Admin, user.Id, "Welcome to Plantour");
    }

    public async Task SendParticipantInvitationAsync(Guid adminParticipantId)
    {
        _currentUser.RaiseIfNotAdmin();

        var entities = await _adminsParticipantRepository.FindFullAsync(x => x.Id == adminParticipantId && x.AdminId == _currentUser.AdminId && x.Participant.AccessType!.Name == "Active" && x.Admin.AccessType!.Name == "Active");

        if (!entities.Any())
        {
            throw new CustomException("Active admin and participant not found or access denied");
        }

        Tuple<string, string> accessCodeResult = await _adminsParticipantService.GenerateAccessCodeAsync();

        string accessCode = accessCodeResult.Item1;
        string accessCodeHash = accessCodeResult.Item2;

        var ap = entities.First();

        ap.AccessCodeHash = accessCodeHash;

        ap.Notes = _environment.IsDevelopment()
            ? accessCode
            : ap.Notes;

        await _adminsParticipantRepository.UpdateAsync(ap);

        var r = await CreateAuthResponseAsync(ap.Participant, UserRole.Participant, _currentUser.AdminId, "Welcome to Plantour");

        await _invitationService.SendInvitationEmailByIdAsync(adminParticipantId, accessCode, r);
    }

    private void EnsureActiveUser(User user)
    {
        if (user.AccessType.Name != "Active")
        {
            throw new CustomException("The user is not active");
        }
    }

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


        switch (normalizedProvider)
        {
            case "google":
                if (string.IsNullOrWhiteSpace(user.GoogleSub))
                {
                    return MapUserDto(user);
                }


                user.GoogleSub = null;
                break;
            case "facebook":
                if (string.IsNullOrWhiteSpace(user.FacebookUserId))
                {
                    return MapUserDto(user);
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
        var  user = await _usersRepository.GetByEmailAsync(request.Email);

        // Ensure participant user exists or create new
        if (user == null)
        {
            user = new User
            {
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                Notes = $"Registered by admin {_currentUser.Email} on {DateTime.UtcNow}",
                AccessTypeId = await _accessTypeRepository.GetActiveId()
            };
            await _usersRepository.AddAsync(user);
        } else if (!user.AccessType.Name.Equals("Active", StringComparison.OrdinalIgnoreCase))
        {
            throw new CustomException("Cannot sign up participant. The participant account is not active.");
        }

        if (await _adminsParticipantRepository.AnyAsync(x => x.AdminId == _currentUser.AdminId && x.ParticipantId == user.Id))
        {
            throw new CustomException("Participant with this email is already registered under your admin account");
        }

        var adminExists = await _usersRepository.ActiveUserExistsByIdAsync(_currentUser.UserId);

        if (!adminExists)
        {
            throw new CustomException("Cannot sign up participant. Current active admin user does not exist.");
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
            ParticipantId = user.Id,
            AccessCodeHash = accessCodeHash,
            Notes = notes
        };

        await _adminsParticipantRepository.AddAsync(adminParticipant);

        var authResponse = await CreateAuthResponseAsync(user, UserRole.Participant, _currentUser.AdminId, "Welcome to Plantour");

        await _invitationService.SendInvitationEmailByIdAsync(adminParticipant.Id, accessCode, authResponse);

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

        return await CreateAuthResponseAsync(participant, UserRole.Participant, admin.Id, "Welcome back to Plantour");
    }

    #endregion


    #region Token Generation

    // The user exists in the DB
    private async Task<AuthResponse> CreateAuthResponseAsync(User user, UserRole role, Guid adminId, string? message = null)
    {
        AccessTokenResult accessToken = await _tokenService.CreateAccessToken(user, role, adminId);
        RefreshToken refreshTokenObject = await _tokenService.GenerateRefreshToken(user.Id);

        return new AuthResponse
        {
            AccessToken = accessToken.Token,
            RefreshToken = refreshTokenObject.Token.ToString(),
            AccessTokenExpiresAtUtc = accessToken.ExpiresAtUtc,
            EmailSignInRequired = false,
            StatusCode = 200,
            Code = "ACCESS_OK",
            Message = message ?? "Welcome back to Plantour"
        };
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

    public async Task<object> UpdateProfileAsync(UpdateProfileRequest request)
    {
        var user = await _usersRepository.GetByIdAsync(_currentUser.UserId) ?? throw new CustomException("User not found");
        
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new CustomException("Email cannot be empty");
        }

        bool emailChanged = !string.Equals(user.Email, request.Email, StringComparison.OrdinalIgnoreCase);

        // Check if email is being changed and if it already exists
        if (emailChanged)
        {
            if (!user.Temporary)
            {
                throw new CustomException("Cannot change email for non-temporary user");
            }
            user.Temporary = false;

            var existingUser = await _usersRepository.GetByEmailAsync(request.Email!);
            if (existingUser != null)
            {
                throw new CustomException("This email is already in use by another account");
            }
            user.Email = request.Email!;
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Phone = request.Phone;

        await _usersRepository.UpdateAsync(user);

        var result = new
        {
            updatedProfile = MapUserDto(user),
            redirectToSignin = emailChanged ? true : false
        };

        return result;
    }


    #endregion

    public async Task<LandingDto> GetLandingAsync()
    {
        var paddleProducts = await _paddleService.GetActiveProductsAsync();
        if (paddleProducts == null || !paddleProducts.Any())
        {
            throw new CustomException("No active Paddle products found");
        }

        var plans = await _planRepository.GetAll();
        plans = plans.Where(p => p.Public!.Value).ToList();
        var planDtos = _mapper.Map<List<PlanDto>>(plans);

        paddleProducts.ToList().ForEach(pp =>
        {
            var plan = planDtos.FirstOrDefault(p => p.PaddleProductId == pp.Id) ?? throw new CustomException($"No plan found for Paddle product Id {pp.Id}");
            _mapper.Map(pp, plan);
        });

        var result = new LandingDto()
        {
            Plans = planDtos,
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

        return await CreateAuthResponseAsync(user, UserRole.Admin, user.Id, "Welcome to Plantour");
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

        return await CreateAuthResponseAsync(user, UserRole.Admin, user.Id, "Welcome to Plantour");
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

            await _usersRepository.UpdateAsync(emailUser);
            EnsureUserCanSignIn(emailUser);
            return emailUser;
        }

        var newUser = new User
        {
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            AccessTypeId = await _accessTypeRepository.GetActiveId(),
            //PriceEnumId = (int?)PlanPrice.Starter,
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
            HasGoogleLinked = !string.IsNullOrWhiteSpace(user.GoogleSub),
            HasFacebookLinked = !string.IsNullOrWhiteSpace(user.FacebookUserId),
            ParticipantCode = user.ParticipantCode
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

    public async Task<AuthResponseDto> RefreshTokenAsync(TokenRequestDto request)
    {
        bool valid = _tokenService.ValidateTokenExcludingExpired(request.AccessToken);

        if (!valid)
        {
            throw new CustomException("Invalid access token", "REFRESH_TOKEN_FAILED");
        }

        var data = _tokenService.TokenToKeyValuePairs(request.AccessToken);

        string? role = data.FirstOrDefault(kv => kv.Key == "role").Value;
        if (string.IsNullOrWhiteSpace(role))
        {
            throw new CustomException("Role claim is missing or invalid in access token", "REFRESH_TOKEN_FAILED");
        }

        string? user_id = data.FirstOrDefault(kv => kv.Key == "user_id").Value;
        if (string.IsNullOrWhiteSpace(user_id) || !Guid.TryParse(user_id, out Guid userId))
        {
            throw new CustomException("User Id claim is missing or invalid in access token", "REFRESH_TOKEN_FAILED");
        }

        Guid adminId = userId;

        if (role == "Participant")
        {
            string? admin_id = data.FirstOrDefault(kv => kv.Key == "admin_id").Value;
            if (string.IsNullOrWhiteSpace(admin_id) || !Guid.TryParse(admin_id, out adminId))
            {
                throw new CustomException("Admin Id claim is missing or invalid in access token", "REFRESH_TOKEN_FAILED");
            }

            var admin = await _usersRepository.GetActiveByIdAsync(adminId);
            if (admin == null)
            {
                throw new CustomException("Active admin not found while refreshing token", "REFRESH_TOKEN_FAILED");
            }

            adminId = admin.Id;
        }


        string? temporary = data.FirstOrDefault(kv => kv.Key == "temporary").Value;
        if (string.IsNullOrWhiteSpace(temporary))
        {
            throw new CustomException("Temporary claim is missing or invalid in access token", "REFRESH_TOKEN_FAILED");
        }

        bool isTemporary = temporary == "true";

        if (isTemporary)
        {
            throw new CustomException("Tokens for temporary users cannot be refreshed", "REFRESH_TOKEN_FAILED");
        }

        User? user = await _usersRepository.GetActiveByIdAsync(userId);

        if (user == null)
        {
            throw new CustomException("Active user not found while refreshing token", "REFRESH_TOKEN_FAILED");
        }

        var existingRefreshTokens = await _refreshTokenRepository.FindAsync(rt => rt.UserId == userId && rt.Token == Guid.Parse(request.RefreshToken));

        var existingRefreshToken = existingRefreshTokens.FirstOrDefault();

        if (existingRefreshToken == null)
        {
            throw new CustomException("Refresh token not found", "REFRESH_TOKEN_FAILED");
        }

        if (existingRefreshToken.ExpiresAt <= DateTime.UtcNow)
        {
            await _refreshTokenRepository.DeleteAsync(existingRefreshToken.Id);
            throw new CustomException("Refresh token has expired", "REFRESH_TOKEN_FAILED");
        }

        var newRefreshToken = await _tokenService.GenerateRefreshToken(userId);

        UserRole userRole = role == "Admin" ? UserRole.Admin : UserRole.Participant;

        AuthResponseDto result = new()
        {
            AccessToken = (await _tokenService.CreateAccessToken(user, userRole, adminId)).Token,
            RefreshToken = newRefreshToken.Token.ToString()
        };

        return result;
    }

    public async Task<ScheduledPlanDowngradeInfoDto> GetScheduledPlanDowngradeInfoAsync()
    {
        _currentUser.RaiseIfNotAdmin();

        var initIdentifier = _currentUser.UserId.ToString();

        var job = await _timeTickerRepository.GetLatestActiveByFunctionAndIdentifierAsync(
            TickerQPlanDowngradeTask.FunctionName,
            initIdentifier);

        if (job == null)
        {
            return new ScheduledPlanDowngradeInfoDto
            {
                HasScheduledDowngrade = false
            };
        }

        if (job.ExecutionTime == null)
        {
            throw new CustomException("Scheduled job has no execution time");
        }

        string? oldPlanPrice = null;
        string? newPlanPrice = null;

        if (job.Request is { Length: > 0 })
        {
            var payload = JsonSerializer.Deserialize<TickerQPlanDowngradeTask.PlanDowngradePayload>(job.Request);
            oldPlanPrice = payload?.OldPlanPrice;
            newPlanPrice = payload?.NewPlanPrice;
        }


        string ct = DateTime.SpecifyKind(job.CreatedAt, DateTimeKind.Utc).ToString("o");
        string et = DateTime.SpecifyKind(job.ExecutionTime.Value, DateTimeKind.Utc).ToString("o");

        return new ScheduledPlanDowngradeInfoDto
        {
            HasScheduledDowngrade = true,
            JobId = job.Id,
            CreatedAt = ct,
            ExecutionTime = et,
            OldPlanPrice = oldPlanPrice,
            NewPlanPrice = newPlanPrice
        };
    }


    public async Task<bool> CancelScheduledPlanDowngradeAsync()
    {
        _currentUser.RaiseIfNotAdmin();

        var initIdentifier = _currentUser.UserId.ToString();

        return await _timeTickerRepository.CancelLatestActiveByFunctionAndIdentifierAsync(
            TickerQPlanDowngradeTask.FunctionName,
            initIdentifier);
    }
    public async Task<bool> IsUserTemporary(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new CustomException("Email is required");
        }
        var user = await _usersRepository.GetByEmailAsync(email);
        return user?.Temporary ?? false;
    }

    public async Task ConvertTemporaryUserAsync(string oldEmail, string newEmail)
    {
        if (string.IsNullOrWhiteSpace(oldEmail) || string.IsNullOrWhiteSpace(newEmail))
        {
            throw new CustomException("Old email and new email are required");
        }
        oldEmail = oldEmail.Trim();
        newEmail = newEmail.Trim();

        if (string.Equals(oldEmail, newEmail, StringComparison.OrdinalIgnoreCase))
        {
            throw new CustomException("Old email and new email cannot be the same");
        }
        
        var user = await _usersRepository.GetByEmailAsync(oldEmail);
        if (user == null)
        {
            throw new CustomException("A temporary user with the old email not found");
        }

        if (!user.Temporary)
        {
            throw new CustomException("User with the old email is not temporary");
        }

        var existingUser = await _usersRepository.GetByEmailAsync(newEmail);
        if (existingUser != null)
        {
            throw new CustomException("The new email is already in use by another account");
        }

        user.FirstName = null;
        user.LastName = null;
        user.Email = newEmail;
        user.Temporary = false;
        user.AccessTypeId = await _accessTypeRepository.GetActiveId();

        await _usersRepository.UpdateAsync(user);
    }

}

