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

public class AuthService : IAuthService
{
    private readonly AuthRepository _authRepository;
    private readonly AdminsParticipantRepository _adminsParticipantRepository;

    private readonly IMapper _mapper;
    private readonly JwtSettings _jwtSettings;

    public AuthService(IOptions<JwtSettings> jwtSettings, IMapper mapper, AuthRepository authRepository, AdminsParticipantRepository adminsParticipantRepository)
    {
        _jwtSettings = jwtSettings.Value;
        _mapper = mapper;
        _authRepository = authRepository;
        _adminsParticipantRepository = adminsParticipantRepository;
    }

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

    private void CreateAccessCodeHash(string accessCode, out byte[] accessCodeHash, out byte[] accessCodeSalt)
    {
        using var hmac = new HMACSHA512();
        accessCodeSalt = hmac.Key;
        accessCodeHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(accessCode));
    }

    private bool VerifyAccessCodeHash(string accessCode, byte[] storedHash, byte[] storedSalt)
    {
        using var hmac = new HMACSHA512(storedSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(accessCode));
        return computedHash.SequenceEqual(storedHash);
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

    public async Task<AdminsParticipantDto> SignUpParticipantAsync(SignUpParticipantRequest request)
    {
        var currentUser = _authRepository.CurrentUser;
        if (currentUser == null || !currentUser.IsAdmin)
        {
            throw new UnauthorizedAccessException("Only admins can register participants");
        }

        User? participant = _authRepository.GetByEmailAsync(request.Email).Result;

        // Ensure participant user exists or create new
        if (participant == null)
        {
            participant = new User
            {
                Email = request.Email,
                PasswordHash = null,
                PasswordSalt = null,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                Notes = $"Registered by admin {currentUser.Email} on {DateTime.UtcNow}"
            };
            await _authRepository.AddAsync(participant);
        }

        if (await _adminsParticipantRepository.AnyByParticipantEmailAsync(request.Email))
        {
            throw new InvalidOperationException("Participant with this email is already registered under your admin account");
        }

        // Generate unique access code
        var accessCode = await AccessCodeGenerator.GenerateUniqueAsync(async code =>
        {
            CreateAccessCodeHash(code, out var hash, out var salt);
            return await _adminsParticipantRepository.AnyByAccessCodeHash(hash);
        });

        // Hash access code
        CreateAccessCodeHash(accessCode, out var accessCodeHash, out var accessCodeSalt);

        // Create admin-participant relationship
        var adminParticipant = new AdminsParticipant
        {
            ParticipantId = participant.Id,
            AccessCodeHash = accessCodeHash,
            AccessCodeSalt = accessCodeSalt,
            Notes = request.Notes,
            ParticipantStatus = request.ParticipantStatus,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone
        };

        await _adminsParticipantRepository.AddAsync(adminParticipant);

        AdminsParticipantDto result = _mapper.Map<AdminsParticipantDto>(adminParticipant);

        return result;
    }

    public async Task<AuthResponse> SignInParticipantAsync(SignInParticipantRequest request)
    {
        // Hash access code
        var accessCode = request.AccessCode;
        AdminsParticipant? adminParticipant = null;
        foreach (var ap in await _adminsParticipantRepository.GetAllAsync())
        {
            if (ap.AccessCodeHash != null && ap.AccessCodeSalt != null && VerifyAccessCodeHash(accessCode, ap.AccessCodeHash, ap.AccessCodeSalt))
            {
                adminParticipant = ap;
                break;
            }
        }
        if (adminParticipant == null)
        {
            throw new UnauthorizedAccessException("Cannot signin participant with provided access code");
        }
        var participant = adminParticipant.Participant;
        var admin = adminParticipant.Admin;
        // Generate participant tokens
        return await GenerateParticipantAuthResponse(participant, admin, accessCode);
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
        User participant, User admin, string accessCode)
    {
        var accessToken = GenerateParticipantAccessToken(participant, admin, accessCode);

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

    private string GenerateParticipantAccessToken(User participant, User admin, string accessCode)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

        var claims = GenerateUserClaims(participant);
        claims.Add(new Claim(PlantourClaims.Role, PlantourRoles.Participant));
        claims.Add(new Claim(PlantourClaims.AccessCode, accessCode));
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