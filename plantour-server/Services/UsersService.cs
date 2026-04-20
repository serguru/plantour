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
using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.Extensions;
using plantour_server.Logging;

namespace plantour_server.Services;


public class UsersService(
    IMapper mapper,
    IPlantourLogger logger,
    UsersRepository usersRepository,
    AdminsParticipantRepository adminsParticipantRepository,
    IAdminsParticipantService adminsParticipantService,
    PlanRepository planRepository,
    SettingsRepository settingsRepository,
    AccessTypeRepository accessTypeRepository,
    ITokenService tokenService,
    IWebHostEnvironment environment,
    IInvitationService invitationService,
    HttpCurrentUser httpCurrentUser,
    AccessCodeGenerator accessCodeGenerator,
    IHttpClientFactory httpClientFactory,
    IAccessRulesService accessRulesService,
    RefreshTokenRepository refreshTokenRepository,
    IPaymentProcessorService paymentProcessorService,
    ISignInEmailService signInEmailService,
    IOptions<SocialAuthSettings> socialAuthSettings,
    ServerSettingsService serverSettingsService,
    IDataProtectionProvider dataProtectionProvider) : IUsersService
{
    private const string UserCreatedLogCategory = "User created";
    private readonly AccessCodeGenerator _accessCodeGenerator = accessCodeGenerator;
    private readonly IPlantourLogger _logger = logger;
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
    private readonly IPaymentProcessorService _paymentProcessorService = paymentProcessorService;
    private readonly IMapper _mapper = mapper;
    private readonly ITokenService _tokenService = tokenService;
    private readonly ServerSettingsService _serverSettingsService = serverSettingsService;
    private readonly IWebHostEnvironment _environment = environment;
    private readonly ISignInEmailService _signInEmailService = signInEmailService;
    private readonly ITimeLimitedDataProtector _googleOAuthStateProtector = dataProtectionProvider.CreateProtector("Plantour.GoogleOAuthState").ToTimeLimitedDataProtector();
    private readonly ITimeLimitedDataProtector _googleOAuthTokenProtector = dataProtectionProvider.CreateProtector("Plantour.GoogleOAuthToken").ToTimeLimitedDataProtector();
    private readonly ITimeLimitedDataProtector _facebookOAuthStateProtector = dataProtectionProvider.CreateProtector("Plantour.FacebookOAuthState").ToTimeLimitedDataProtector();
    private readonly ITimeLimitedDataProtector _facebookOAuthTokenProtector = dataProtectionProvider.CreateProtector("Plantour.FacebookOAuthToken").ToTimeLimitedDataProtector();
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
            LogUserCreated(user, "Admin");
        }

        await EnsureActiveUserAsync(user);

        return await CreateAuthResponseAsync(user, UserRole.Admin, user.Id, "Welcome to Plantour");
    }

    public string BuildGoogleOAuthAuthorizeUrl(string callbackUrl, string? returnUrl)
    {
        if (string.IsNullOrWhiteSpace(_socialAuthSettings.GoogleClientId) || string.IsNullOrWhiteSpace(_socialAuthSettings.GoogleClientSecret))
        {
            throw new CustomException("Google OAuth login is not configured on server");
        }

        if (string.IsNullOrWhiteSpace(callbackUrl))
        {
            throw new CustomException("Google OAuth callback URL is required");
        }

        string resolvedReturnUrl = ResolveGoogleReturnUrl(returnUrl);

        var statePayload = new GoogleOAuthStatePayload
        {
            ReturnUrl = resolvedReturnUrl,
            CallbackUrl = callbackUrl,
            Nonce = Guid.NewGuid().ToString("N")
        };

        string serializedState = JsonSerializer.Serialize(statePayload);
        string protectedState = _googleOAuthStateProtector.Protect(serializedState, TimeSpan.FromMinutes(10));

        var query = new Dictionary<string, string>
        {
            ["client_id"] = _socialAuthSettings.GoogleClientId,
            ["redirect_uri"] = callbackUrl,
            ["response_type"] = "code",
            ["scope"] = "openid email profile",
            ["state"] = protectedState,
            ["prompt"] = "select_account"
        };

        string queryString = string.Join("&", query.Select(pair => $"{pair.Key}={Uri.EscapeDataString(pair.Value)}"));
        return $"https://accounts.google.com/o/oauth2/v2/auth?{queryString}";
    }

    public async Task<string> HandleGoogleOAuthCallbackAsync(string callbackUrl, string? code, string? state, string? error)
    {
        string returnUrl = ResolveGoogleReturnUrl(null);
        GoogleOAuthStatePayload? statePayload = null;

        if (!string.IsNullOrWhiteSpace(state))
        {
            try
            {
                string unprotectedState = _googleOAuthStateProtector.Unprotect(state);
                statePayload = JsonSerializer.Deserialize<GoogleOAuthStatePayload>(unprotectedState);
                if (!string.IsNullOrWhiteSpace(statePayload?.ReturnUrl))
                {
                    returnUrl = ResolveGoogleReturnUrl(statePayload.ReturnUrl);
                }
            }
            catch
            {
                return BuildGoogleOAuthRedirectErrorUrl(returnUrl, "Google state validation failed");
            }
        }

        if (!string.IsNullOrWhiteSpace(error))
        {
            return BuildGoogleOAuthRedirectErrorUrl(returnUrl, $"Google authentication failed: {error}");
        }

        if (string.IsNullOrWhiteSpace(code))
        {
            return BuildGoogleOAuthRedirectErrorUrl(returnUrl, "Google authorization code is missing");
        }

        if (statePayload == null || string.IsNullOrWhiteSpace(statePayload.CallbackUrl) || !string.Equals(statePayload.CallbackUrl, callbackUrl, StringComparison.Ordinal))
        {
            return BuildGoogleOAuthRedirectErrorUrl(returnUrl, "Google callback validation failed");
        }

        GoogleTokenResponse tokenResponse;

        try
        {
            var httpClient = _httpClientFactory.CreateClient();
            var form = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["code"] = code,
                ["client_id"] = _socialAuthSettings.GoogleClientId,
                ["client_secret"] = _socialAuthSettings.GoogleClientSecret,
                ["redirect_uri"] = callbackUrl,
                ["grant_type"] = "authorization_code"
            });

            var response = await httpClient.PostAsync("https://oauth2.googleapis.com/token", form);
            if (!response.IsSuccessStatusCode)
            {
                string responseBody = await response.Content.ReadAsStringAsync();
                string details = ExtractGoogleTokenExchangeError(responseBody);
                return BuildGoogleOAuthRedirectErrorUrl(returnUrl, $"Google token exchange failed: {details}");
            }

            tokenResponse = await response.Content.ReadFromJsonAsync<GoogleTokenResponse>()
                ?? throw new CustomException("Google token response is empty");
        }
        catch
        {
            return BuildGoogleOAuthRedirectErrorUrl(returnUrl, "Google token exchange failed");
        }

        if (string.IsNullOrWhiteSpace(tokenResponse.IdToken))
        {
            return BuildGoogleOAuthRedirectErrorUrl(returnUrl, "Google ID token is missing");
        }

        string protectedToken = _googleOAuthTokenProtector.Protect(tokenResponse.IdToken, TimeSpan.FromMinutes(2));

        return AppendQueryParameter(returnUrl, "googleOAuthToken", protectedToken);
    }

    public async Task<AuthResponse> CompleteGoogleOAuthSignInAsync(string protectedGoogleOAuthToken)
    {
        var normalizedProtectedToken = NormalizeProtectedOAuthToken(protectedGoogleOAuthToken);

        if (string.IsNullOrWhiteSpace(normalizedProtectedToken))
        {
            throw new CustomException("Google OAuth token is required");
        }

        string googleIdToken;

        try
        {
            googleIdToken = _googleOAuthTokenProtector.Unprotect(normalizedProtectedToken);
        }
        catch
        {
            throw new UnauthorizedException("Google OAuth token is invalid or expired", "NO_ACCESS");
        }

        return await SignInWithGoogleAsync(googleIdToken);
    }

    public string BuildFacebookOAuthAuthorizeUrl(string callbackUrl, string? returnUrl)
    {
        if (string.IsNullOrWhiteSpace(_socialAuthSettings.FacebookAppId) || string.IsNullOrWhiteSpace(_socialAuthSettings.FacebookAppSecret))
        {
            throw new CustomException("Facebook OAuth login is not configured on server");
        }

        if (string.IsNullOrWhiteSpace(callbackUrl))
        {
            throw new CustomException("Facebook OAuth callback URL is required");
        }

        string resolvedReturnUrl = ResolveFacebookReturnUrl(returnUrl);

        var statePayload = new FacebookOAuthStatePayload
        {
            ReturnUrl = resolvedReturnUrl,
            CallbackUrl = callbackUrl,
            Nonce = Guid.NewGuid().ToString("N")
        };

        string serializedState = JsonSerializer.Serialize(statePayload);
        string protectedState = _facebookOAuthStateProtector.Protect(serializedState, TimeSpan.FromMinutes(10));

        var query = new Dictionary<string, string>
        {
            ["client_id"] = _socialAuthSettings.FacebookAppId,
            ["redirect_uri"] = callbackUrl,
            ["response_type"] = "code",
            ["scope"] = "email,public_profile",
            ["state"] = protectedState
        };

        string queryString = string.Join("&", query.Select(pair => $"{pair.Key}={Uri.EscapeDataString(pair.Value)}"));
        return $"https://www.facebook.com/v23.0/dialog/oauth?{queryString}";
    }

    public async Task<string> HandleFacebookOAuthCallbackAsync(string callbackUrl, string? code, string? state, string? error, string? errorReason, string? errorDescription)
    {
        string returnUrl = ResolveFacebookReturnUrl(null);
        FacebookOAuthStatePayload? statePayload = null;

        if (!string.IsNullOrWhiteSpace(state))
        {
            try
            {
                string unprotectedState = _facebookOAuthStateProtector.Unprotect(state);
                statePayload = JsonSerializer.Deserialize<FacebookOAuthStatePayload>(unprotectedState);
                if (!string.IsNullOrWhiteSpace(statePayload?.ReturnUrl))
                {
                    returnUrl = ResolveFacebookReturnUrl(statePayload.ReturnUrl);
                }
            }
            catch
            {
                return BuildFacebookOAuthRedirectErrorUrl(returnUrl, "Facebook state validation failed");
            }
        }

        if (!string.IsNullOrWhiteSpace(error) || !string.IsNullOrWhiteSpace(errorReason) || !string.IsNullOrWhiteSpace(errorDescription))
        {
            string details = string.Join("; ", new[] { error, errorReason, errorDescription }.Where(v => !string.IsNullOrWhiteSpace(v)));
            return BuildFacebookOAuthRedirectErrorUrl(returnUrl, $"Facebook authentication failed: {details}");
        }

        if (string.IsNullOrWhiteSpace(code))
        {
            return BuildFacebookOAuthRedirectErrorUrl(returnUrl, "Facebook authorization code is missing");
        }

        if (statePayload == null || string.IsNullOrWhiteSpace(statePayload.CallbackUrl) || !string.Equals(statePayload.CallbackUrl, callbackUrl, StringComparison.Ordinal))
        {
            return BuildFacebookOAuthRedirectErrorUrl(returnUrl, "Facebook callback validation failed");
        }

        FacebookOAuthTokenResponse tokenResponse;

        try
        {
            var httpClient = _httpClientFactory.CreateClient();

            var query = new Dictionary<string, string>
            {
                ["client_id"] = _socialAuthSettings.FacebookAppId,
                ["client_secret"] = _socialAuthSettings.FacebookAppSecret,
                ["redirect_uri"] = callbackUrl,
                ["code"] = code
            };

            string queryString = string.Join("&", query.Select(pair => $"{pair.Key}={Uri.EscapeDataString(pair.Value)}"));
            var response = await httpClient.GetAsync($"https://graph.facebook.com/v23.0/oauth/access_token?{queryString}");

            if (!response.IsSuccessStatusCode)
            {
                string responseBody = await response.Content.ReadAsStringAsync();
                string details = ExtractFacebookTokenExchangeError(responseBody);
                return BuildFacebookOAuthRedirectErrorUrl(returnUrl, $"Facebook token exchange failed: {details}");
            }

            tokenResponse = await response.Content.ReadFromJsonAsync<FacebookOAuthTokenResponse>()
                ?? throw new CustomException("Facebook token response is empty");
        }
        catch
        {
            return BuildFacebookOAuthRedirectErrorUrl(returnUrl, "Facebook token exchange failed");
        }

        if (string.IsNullOrWhiteSpace(tokenResponse.AccessToken))
        {
            return BuildFacebookOAuthRedirectErrorUrl(returnUrl, "Facebook access token is missing");
        }

        string protectedToken = _facebookOAuthTokenProtector.Protect(tokenResponse.AccessToken, TimeSpan.FromMinutes(2));

        return AppendQueryParameter(returnUrl, "facebookOAuthToken", protectedToken);
    }

    public async Task<AuthResponse> CompleteFacebookOAuthSignInAsync(string protectedFacebookOAuthToken)
    {
        var normalizedProtectedToken = NormalizeProtectedOAuthToken(protectedFacebookOAuthToken);

        if (string.IsNullOrWhiteSpace(normalizedProtectedToken))
        {
            throw new CustomException("Facebook OAuth token is required");
        }

        string facebookAccessToken;
        try
        {
            facebookAccessToken = _facebookOAuthTokenProtector.Unprotect(normalizedProtectedToken);
        }
        catch
        {
            throw new CustomException("Facebook OAuth token is invalid or expired", "NO_ACCESS");
        }

        return await SignInWithFacebookAsync(facebookAccessToken);
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

    private async Task EnsureActiveUserAsync(User user)
    {
        if (user.AccessType == null)
        {
            var accessType = await _accessTypeRepository.GetByIdAsync(user.AccessTypeId);
            if (accessType == null)
            {
                throw new CustomException("The user access type is missing");
            }

            user.AccessType = accessType;
        }

        if (!string.Equals(user.AccessType?.Name, "Active", StringComparison.OrdinalIgnoreCase))
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
            LogUserCreated(user, "Participant");
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
        var paymentProcessorProducts = await _paymentProcessorService.GetActiveProductsAsync();
        if (paymentProcessorProducts == null || !paymentProcessorProducts.Any())
        {
            throw new CustomException("No active payment processor products found");
        }

        // TODO: Open a sample trip must be a link and not a button

        var plans = await _planRepository.GetAll();
        plans = plans.Where(p => p.Public!.Value).ToList();
        var planDtos = _mapper.Map<List<PlanDto>>(plans);

        paymentProcessorProducts.ToList().ForEach(pp =>
        {
            var plan = planDtos.FirstOrDefault(p => p.PaymentProcessorProductId == pp.Id) ?? throw new CustomException($"No plan found for payment processor product Id {pp.Id}");
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

        LogUserCreated(created, "Admin");

        return created;
    }

    private void LogUserCreated(User user, string userType)
    {
        _logger.LogInformation(
            $"userId: {user.Id} email: {user.Email} first_name: {user.FirstName} last_name: {user.LastName} {userType}",
            UserCreatedLogCategory);
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

    private sealed class GoogleTokenResponse
    {
        [JsonPropertyName("id_token")]
        public string? IdToken { get; set; }
    }

    private sealed class GoogleTokenErrorResponse
    {
        [JsonPropertyName("error")]
        public string? Error { get; set; }

        [JsonPropertyName("error_description")]
        public string? ErrorDescription { get; set; }
    }

    private sealed class FacebookOAuthTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string? AccessToken { get; set; }
    }

    private sealed class FacebookTokenErrorResponse
    {
        [JsonPropertyName("error")]
        public FacebookTokenErrorData? Error { get; set; }
    }

    private sealed class FacebookTokenErrorData
    {
        [JsonPropertyName("message")]
        public string? Message { get; set; }

        [JsonPropertyName("type")]
        public string? Type { get; set; }

        [JsonPropertyName("code")]
        public int? Code { get; set; }
    }

    private sealed class GoogleOAuthStatePayload
    {
        public string ReturnUrl { get; set; } = string.Empty;
        public string CallbackUrl { get; set; } = string.Empty;
        public string Nonce { get; set; } = string.Empty;
    }

    private sealed class FacebookOAuthStatePayload
    {
        public string ReturnUrl { get; set; } = string.Empty;
        public string CallbackUrl { get; set; } = string.Empty;
        public string Nonce { get; set; } = string.Empty;
    }

    private string ResolveFacebookReturnUrl(string? returnUrl)
    {
        return ResolveGoogleReturnUrl(returnUrl);
    }

    private string ResolveGoogleReturnUrl(string? returnUrl)
    {
        var candidate = string.IsNullOrWhiteSpace(returnUrl)
            ? _serverSettingsService.GetGoogleOAuthDefaultReturnUrlAsync().GetAwaiter().GetResult()
            : returnUrl;

        if (string.IsNullOrWhiteSpace(candidate))
        {
            throw new CustomException("Google OAuth return URL is not configured");
        }

        if (!Uri.TryCreate(candidate, UriKind.Absolute, out var parsed) || (parsed.Scheme != Uri.UriSchemeHttps && parsed.Scheme != Uri.UriSchemeHttp))
        {
            throw new CustomException("Google OAuth return URL is invalid");
        }

        var allowedOrigins = _serverSettingsService.GetCorsAllowedOriginsAsync().GetAwaiter().GetResult();
        var allowedHosts = allowedOrigins
            .Select(origin =>
            {
                if (Uri.TryCreate(origin, UriKind.Absolute, out var allowedUri))
                {
                    return allowedUri.Host;
                }

                return string.Empty;
            })
            .Where(host => !string.IsNullOrWhiteSpace(host))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        if (!allowedHosts.Contains(parsed.Host))
        {
            throw new CustomException("Google OAuth return URL host is not allowed");
        }

        return parsed.ToString();
    }

    private static string BuildGoogleOAuthRedirectErrorUrl(string returnUrl, string message)
    {
        return AppendQueryParameter(returnUrl, "googleOAuthError", message);
    }

    private static string BuildFacebookOAuthRedirectErrorUrl(string returnUrl, string message)
    {
        return AppendQueryParameter(returnUrl, "facebookOAuthError", message);
    }

    private static string ExtractGoogleTokenExchangeError(string responseBody)
    {
        if (string.IsNullOrWhiteSpace(responseBody))
        {
            return "Unknown error";
        }

        try
        {
            var parsed = JsonSerializer.Deserialize<GoogleTokenErrorResponse>(responseBody);
            if (parsed != null)
            {
                string error = parsed.Error?.Trim() ?? string.Empty;
                string description = parsed.ErrorDescription?.Trim() ?? string.Empty;

                if (!string.IsNullOrWhiteSpace(error) && !string.IsNullOrWhiteSpace(description))
                {
                    return $"{error} - {description}";
                }

                if (!string.IsNullOrWhiteSpace(error))
                {
                    return error;
                }

                if (!string.IsNullOrWhiteSpace(description))
                {
                    return description;
                }
            }
        }
        catch
        {
            // Ignore parsing issues and return raw body below.
        }

        return responseBody;
    }

    private static string ExtractFacebookTokenExchangeError(string responseBody)
    {
        if (string.IsNullOrWhiteSpace(responseBody))
        {
            return "Unknown error";
        }

        try
        {
            var parsed = JsonSerializer.Deserialize<FacebookTokenErrorResponse>(responseBody);
            var error = parsed?.Error;
            if (error != null)
            {
                var parts = new List<string>();

                if (!string.IsNullOrWhiteSpace(error.Type))
                {
                    parts.Add(error.Type.Trim());
                }

                if (error.Code.HasValue)
                {
                    parts.Add($"code {error.Code.Value}");
                }

                if (!string.IsNullOrWhiteSpace(error.Message))
                {
                    parts.Add(error.Message.Trim());
                }

                if (parts.Count > 0)
                {
                    return string.Join(" - ", parts);
                }
            }
        }
        catch
        {
            // Ignore parsing issues and return raw body below.
        }

        return responseBody;
    }

    private static string AppendQueryParameter(string url, string name, string value)
    {
        var separator = url.Contains('?') ? "&" : "?";
        return $"{url}{separator}{name}={Uri.EscapeDataString(value)}";
    }

    private static string NormalizeProtectedOAuthToken(string? token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return string.Empty;
        }

        string trimmed = token.Trim();
        int fragmentIndex = trimmed.IndexOf('#');
        if (fragmentIndex >= 0)
        {
            trimmed = trimmed[..fragmentIndex];
        }

        return trimmed;
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
        return await _paymentProcessorService.GetScheduledPlanDowngradeInfoAsync(_currentUser.UserId);
    }


    public async Task<bool> CancelScheduledPlanDowngradeAsync()
    {
        _currentUser.RaiseIfNotAdmin();
        return await _paymentProcessorService.CancelScheduledPlanDowngradeAsync(_currentUser.UserId);
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

    
    public async Task<string> GetDbVersion()
    {
        string version = (string)await _settingsRepository.GetSettingByKey("app_version");
        return version;
    }

    public async Task<ClientSettingsDto> GetClientSettingsAsync()
    {
        int timeoutSeconds = 30;

        try
        {
            timeoutSeconds = (int)await _settingsRepository.GetSettingByKey("global_spinner_timeout_sec");
        }
        catch (CustomException)
        {
            timeoutSeconds = 30;
        }

        return new ClientSettingsDto
        {
            GlobalSpinnerTimeoutSec = timeoutSeconds
        };
    }

}

