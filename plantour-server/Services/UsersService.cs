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
using PlantourApi.Middleware;

namespace plantour_server.Services;

public class UsersService(
    IOptions<JwtSettings> jwtSettings, 
    IMapper mapper, 
    UsersRepository usersRepository, 
    AdminsParticipantRepository adminsParticipantRepository, 
    IConfiguration configuration, 
    IWebHostEnvironment environment, 
    HttpCurrentUser httpCurrentUser) : IUsersService
{
    private readonly UsersRepository _usersRepository = usersRepository;
    private readonly AdminsParticipantRepository _adminsParticipantRepository = adminsParticipantRepository;

    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;

    private readonly IMapper _mapper = mapper;
    private readonly JwtSettings _jwtSettings = jwtSettings.Value;
    private readonly IConfiguration _configuration = configuration;
    private readonly IWebHostEnvironment _environment = environment;

    #region Admin Authentication

    public async Task<AuthResponse> SignUpAsync(SignUpRequest request)
    {
        // Check if user already exists
        if (await _usersRepository.AnyAsync(x => x.Email.ToLower() == request.Email.ToLower()))
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

        // Generate admin tokens
        return await GenerateAdminAuthResponse(user);
    }

    public async Task<AuthResponse> SignInAsync(SignInRequest request)
    {
        // Find user
        var users = await _usersRepository.FindAsync(x => x.Email.ToLower() == request.Email.ToLower());

        var user = users.FirstOrDefault();

        if (user == null || user.PasswordHash == null || user.PasswordSalt == null)
        {
            throw new CustomException("Invalid email or password");
        }

        // Verify password
        if (!VerifyPasswordHash(request.Password, user.PasswordHash, user.PasswordSalt))
        {
            throw new CustomException("Invalid email or password");
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
            throw new CustomException("Cannot signin participant with provided access code");
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