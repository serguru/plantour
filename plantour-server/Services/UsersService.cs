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

namespace plantour_server.Services;

public class UsersService(
    IOptions<JwtSettings> jwtSettings, 
    IMapper mapper, 
    UsersRepository usersRepository, 
    AdminsParticipantRepository adminsParticipantRepository, 
    ITokenService tokenService,
    IRefreshTokenService refreshTokenService,
    IEmailConfirmationService emailConfirmationService,
    IConfiguration configuration, 
    IWebHostEnvironment environment, 
    HttpCurrentUser httpCurrentUser) : IUsersService
{
    private readonly UsersRepository _usersRepository = usersRepository;
    private readonly AdminsParticipantRepository _adminsParticipantRepository = adminsParticipantRepository;

    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;

    private readonly IMapper _mapper = mapper;
    private readonly JwtSettings _jwtSettings = jwtSettings.Value;
    private readonly ITokenService _tokenService = tokenService;
    private readonly IRefreshTokenService _refreshTokenService = refreshTokenService;
    private readonly IEmailConfirmationService _emailConfirmationService = emailConfirmationService;
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
            Phone = request.Phone
        };

        await _usersRepository.AddAsync(user);

        var emailToken = await _emailConfirmationService.GenerateEmailConfirmationTokenAsync(user);
        await _emailConfirmationService.SendConfirmationEmailAsync(user, emailToken);

        return new AuthResponse
        {
            AccessToken = string.Empty,
            RefreshToken = string.Empty,
            AccessTokenExpiresAtUtc = DateTime.MinValue,
            EmailConfirmationRequired = true
        };
    }

    public async Task<AuthResponse> SignInAsync(SignInRequest request)
    {
        // Find user
        var user = await _usersRepository.GetByEmailAsync(request.Email);

        if (user == null || user.PasswordHash == null || user.PasswordSalt == null || user.AccessType == null || user.AccessType.Name != "Active")
        {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Verify password
        if (!VerifyPasswordHash(request.Password, user.PasswordHash, user.PasswordSalt))
        {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!await _emailConfirmationService.IsEmailConfirmedAsync(user.Id))
        {
            throw new UnauthorizedException("Email not confirmed");
        }

        return await CreateAuthResponseAsync(user, UserRole.Admin, user.Id, null);
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
                Notes = $"Registered by admin {_currentUser.Email} on {DateTime.UtcNow}"
            };
            await _usersRepository.AddAsync(participant);
        }

        if (await _adminsParticipantRepository.AnyAsync(x => x.AdminId == _currentUser.AdminId && x.ParticipantId == participant.Id))
        {
            throw new CustomException("Participant with this email is already registered under your admin account");
        }

        string accessCode = "";
        string accessCodeHash = "";
        for (int i = 0; i < 100; i++)
        {
            accessCode = AccessCodeGenerator.GenerateAccessCode();
            accessCodeHash = AccessCode2Hash(accessCode);
            if (!await _adminsParticipantRepository.AnyAsync(x => x.AccessCodeHash == accessCodeHash))
            {
                break;
            }
            if (i == 99)
            {
                throw new CustomException("Failed to generate unique access code after multiple attempts");
            }
        }

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
            throw new UnauthorizedException("Cannot signin participant with provided access code");
        }

        var participant = adminParticipant.Participant;
        var admin = adminParticipant.Admin;
        return await CreateAuthResponseAsync(participant, UserRole.Participant, admin.Id, null);
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
            throw new UnauthorizedException("Invalid refresh token");
        }

        var user = await _usersRepository.GetByIdWithDetailsAsync(storedToken.UserId);
        if (user == null)
        {
            throw new UnauthorizedException("User not found");
        }

        if (user.AccessType == null || user.AccessType.Name != "Active")
        {
            throw new UnauthorizedException("User is not active");
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
            EmailConfirmationRequired = false
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

    private async Task<AuthResponse> CreateAuthResponseAsync(User user, UserRole role, Guid adminId, string? ipAddress)
    {
        var accessToken = _tokenService.CreateAccessToken(user, role, adminId);
        var refreshToken = _tokenService.CreateRefreshToken();

        await _refreshTokenService.CreateAsync(user.Id, role, adminId, refreshToken, ipAddress);

        return new AuthResponse
        {
            AccessToken = accessToken.Token,
            RefreshToken = refreshToken.Token,
            AccessTokenExpiresAtUtc = accessToken.ExpiresAtUtc,
            EmailConfirmationRequired = false
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
}