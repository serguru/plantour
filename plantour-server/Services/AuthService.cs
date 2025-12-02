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

namespace plantour_server.Services;

public class AuthService : IAuthService
{
    private readonly PlantourContext _context;
    private readonly JwtSettings _jwtSettings;

    public AuthService(PlantourContext context, IOptions<JwtSettings> jwtSettings)
    {
        _context = context;
        _jwtSettings = jwtSettings.Value;
    }

    #region Admin Authentication

    public async Task<AuthResponse> SignUpAsync(SignUpRequest request)
    {
        // Check if user already exists
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new InvalidOperationException("User with this email already exists");
        }

        // Create password hash
        CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);

        // Create new user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Generate admin tokens
        return await GenerateAdminAuthResponse(user);
    }

    public async Task<AuthResponse> SignInAsync(SignInRequest request)
    {
        // Find user
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
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

    public async Task<ParticipantAuthResponse> SignUpParticipantAsync(SignUpParticipantRequest request)
    {
        // Verify admin exists
        var admin = await _context.Users.FindAsync(request.AdminId);
        if (admin == null)
        {
            throw new InvalidOperationException("Admin not found");
        }

        // Check if user already exists
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new InvalidOperationException("User with this email already exists");
        }

        // Create participant user
        byte[]? passwordHash = null;
        byte[]? passwordSalt = null;

        if (!string.IsNullOrEmpty(request.Password))
        {
            CreatePasswordHash(request.Password, out passwordHash, out passwordSalt);
        }

        var participant = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone
        };

        _context.Users.Add(participant);

        // Generate unique access code
        var accessCode = await AccessCodeGenerator.GenerateUniqueAsync(async code =>
            await _context.AdminsParticipants.AnyAsync(ap => ap.AccessCode == code) ||
            await _context.TripUsers.AnyAsync(tu => tu.AccessCode == code) ||
            await _context.Invitations.AnyAsync(i => i.AccessCode == code)
        );

        // Create admin-participant relationship
        var adminParticipant = new AdminsParticipant
        {
            Id = Guid.NewGuid(),
            AdminId = request.AdminId,
            ParticipantId = participant.Id,
            AccessCode = accessCode
        };

        _context.AdminsParticipants.Add(adminParticipant);
        await _context.SaveChangesAsync();

        // Generate participant tokens
        return await GenerateParticipantAuthResponse(participant, admin, accessCode);
    }

    public async Task<ParticipantAuthResponse> SignInParticipantAsync(SignInParticipantRequest request)
    {
        // Find admin-participant relationship by access code
        var adminParticipant = await _context.AdminsParticipants
            .Include(ap => ap.Participant)
            .Include(ap => ap.Admin)
            .FirstOrDefaultAsync(ap => ap.AccessCode == request.AccessCode);

        if (adminParticipant == null)
        {
            throw new UnauthorizedAccessException("Invalid access code");
        }

        var participant = adminParticipant.Participant;
        var admin = adminParticipant.Admin;

        // Generate participant tokens
        return await GenerateParticipantAuthResponse(participant, admin, request.AccessCode);
    }

    public async Task<string> GenerateAccessCodeAsync(Guid adminId, Guid participantId)
    {
        // Verify relationship exists
        var relationship = await _context.AdminsParticipants
            .FirstOrDefaultAsync(ap => ap.AdminId == adminId && ap.ParticipantId == participantId);

        if (relationship == null)
        {
            throw new InvalidOperationException("Admin-Participant relationship not found");
        }

        return relationship.AccessCode;
    }

    #endregion

    #region Token Management

    public async Task<object> RefreshTokenAsync(string refreshToken)
    {
        var token = await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (token == null || !token.IsActive)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token");
        }

        // Revoke old token
        token.RevokedAt = DateTime.UtcNow;

        // Decode the old token to determine role
        var handler = new JwtSecurityTokenHandler();
        var oldAccessToken = token.Token; // This is refresh token, we need to check user's role from DB

        // Check if user is in admin-participant relationship as participant
        var participantRelationship = await _context.AdminsParticipants
            .Include(ap => ap.Admin)
            .FirstOrDefaultAsync(ap => ap.ParticipantId == token.UserId);

        object response;
        if (participantRelationship != null)
        {
            // Generate new participant tokens
            response = await GenerateParticipantAuthResponse(
                token.User,
                participantRelationship.Admin,
                participantRelationship.AccessCode);
        }
        else
        {
            // Generate new admin tokens
            response = await GenerateAdminAuthResponse(token.User);
        }

        token.ReplacedByToken = refreshToken;
        await _context.SaveChangesAsync();

        return response;
    }

    public async Task RevokeTokenAsync(string refreshToken)
    {
        var token = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (token == null || !token.IsActive)
        {
            throw new InvalidOperationException("Token not found or already revoked");
        }

        token.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

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
        var refreshToken = await GenerateRefreshToken(user.Id);

        return new AuthResponse
        {
            UserId = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes)
        };
    }

    private async Task<ParticipantAuthResponse> GenerateParticipantAuthResponse(
        User participant, User admin, string accessCode)
    {
        var accessToken = GenerateParticipantAccessToken(participant, admin, accessCode);
        var refreshToken = await GenerateRefreshToken(participant.Id);

        return new ParticipantAuthResponse
        {
            UserId = participant.Id,
            Email = participant.Email,
            FirstName = participant.FirstName,
            LastName = participant.LastName,
            AccessCode = accessCode,
            AdminId = admin.Id,
            AdminEmail = admin.Email,
            AdminFirstName = admin.FirstName,
            AdminLastName = admin.LastName,
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            Role = PlantourRoles.Participant
        };
    }

    private List<Claim>  GenerateUserClaims(User user)
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

    private async Task<RefreshToken> GenerateRefreshToken(Guid userId)
    {
        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return refreshToken;
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