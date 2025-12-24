// AccessCode hash helpers (same as password)
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.DbModels;
using plantour_server.Utils;
using AutoMapper;
using PlantourApi.Models;
using plantour_server.Repositories;

namespace plantour_server.Services;

public class AuthService(IOptions<JwtSettings> jwtSettings, IMapper mapper, AuthRepository authRepository, AdminsParticipantRepository2 adminsParticipantRepository, IConfiguration configuration, IWebHostEnvironment environment, HttpCurrentUser httpCurrentUser) : IAuthService
{
    private readonly AuthRepository _authRepository = authRepository;
    private readonly AdminsParticipantRepository2 _adminsParticipantRepository = adminsParticipantRepository;

    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;

    private readonly IMapper _mapper = mapper;
    private readonly JwtSettings _jwtSettings = jwtSettings.Value;
    private readonly IConfiguration _configuration = configuration;
    private readonly IWebHostEnvironment _environment = environment;

    #region Admin Authentication

    public async Task<AuthResponse> SignUpAsync(SignUpRequest request)
    {
        // Check if user already exists
        if (await _authRepository.AnyByEmailAsync(request.Email))
        {
            throw new InvalidOperationException("User with this email already exists");
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

        await _authRepository.AddAsync(user);

        // Generate admin tokens
        return await GenerateAdminAuthResponse(user);
    }

    public async Task<AuthResponse> SignInAsync(SignInRequest request)
    {
        // Find user
        var user = await _authRepository.GetByEmailAsync(request.Email);
        if (user == null || user.PasswordHash == null || user.PasswordSalt == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Verify password
        if (!VerifyPasswordHash(request.Password, user.PasswordHash, user.PasswordSalt))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Generate admin tokens
        return await GenerateAdminAuthResponse(user);
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

        User? participant = _authRepository.GetByEmailAsync(request.Email).Result;

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
            await _authRepository.AddAsync(participant);
        }

        if (await _adminsParticipantRepository.AnyAsync(x => x.AdminId == _currentUser.AdminId && x.ParticipantId == participant.Id))
        {
            throw new InvalidOperationException("Participant with this email is already registered under your admin account");
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
                throw new InvalidOperationException("Failed to generate unique access code after multiple attempts");
            }
        }

        string? notes = _environment.IsDevelopment()
            ? accessCode!
            : request.Notes;

        // Create admin-participant relationship
        var adminParticipant = new AdminsParticipant
        {
            ParticipantId = participant.Id,
            AccessCodeHash = accessCodeHash,
            Notes = notes,
            ParticipantStatusId = request.ParticipantStatusId
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
            throw new UnauthorizedAccessException("Cannot signin participant with provided access code");
        }

        var participant = adminParticipant.Participant;
        var admin = adminParticipant.Admin;
        // Generate participant tokens
        return await GenerateParticipantAuthResponse(participant, admin);
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

    #endregion

    #region Token Generation

    private async Task<AuthResponse> GenerateAdminAuthResponse(User user)
    {
        var accessToken = GenerateAdminAccessToken(user);

        return new AuthResponse
        {
            AccessToken = accessToken,
        };
    }

    private async Task<AuthResponse> GenerateParticipantAuthResponse(
        User participant, User admin)
    {
        var accessToken = GenerateParticipantAccessToken(participant, admin);

        return new AuthResponse
        {
            AccessToken = accessToken,
        };
    }

    private List<Claim> GenerateUserClaims(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(PlantourClaims.UserId, user.Id.ToString()),
            new Claim(PlantourClaims.Email, user.Email),
            new Claim(PlantourClaims.FirstName, user.FirstName ?? ""),
            new Claim(PlantourClaims.LastName, user.LastName ?? ""),
            new Claim(PlantourClaims.Expires, DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes).ToString()),
            new Claim(PlantourClaims.Issuer,  _jwtSettings.Issuer),
            new Claim(PlantourClaims.Audience,  _jwtSettings.Audience)
        };
        return claims;
    }

    private string GenerateAdminAccessToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

        var claims = GenerateUserClaims(user);
        claims.Add(new Claim(PlantourClaims.Role, PlantourRoles.Admin));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private string GenerateParticipantAccessToken(User participant, User admin)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

        var claims = GenerateUserClaims(participant);
        claims.Add(new Claim(PlantourClaims.Role, PlantourRoles.Participant));
        claims.Add(new Claim(PlantourClaims.AdminId, admin.Id.ToString()));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
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