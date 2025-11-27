using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Plantour.Models;
using Plantour.Utils;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Plantour.Services;

/// <summary>
/// Plantour authentication helper - coordinates participant tokens and admin (Clerk) users.
/// </summary>
public interface IPlantourAuthService
{
    /// <summary>
    /// Current user context. Contains the admin clerk user (if available) and the current Plantour traveler/trip-traveler (if participant).
    /// </summary>
    PlantourCurrentUser CurrentUser { get; }

    Task<string> RegisterParticipantAsync(Guid adminTravelerId, Guid tripId, string? email = null, string? firstName = null, string? lastName = null, string? phone = null, string? adminClerkToken = null);

    Task<string> LoginWithAccessCodeAsync(string accessCode, string? adminClerkToken = null);

    Task<string> ResetAccessCodeAsync(Guid tripTravelerId);

    Task<string> GenerateParticipantTokenAsync(TripTraveler tripTraveler, string? adminClerkToken = null);

    Task<string> GenerateAccessCodeAsync(Guid tripTravelerId);
}

public sealed class PlantourCurrentUser
{
    /// <summary>Clerk admin user id (string) if available.</summary>
    public string? AdminClerkUserId { get; set; }

    /// <summary>Admin email (if available).</summary>
    public string? AdminEmail { get; set; }

    /// <summary>Plantour traveler record (if present).</summary>
    public Traveler? Traveler { get; set; }

    /// <summary>TripTraveler record (if logged in as participant).</summary>
    public TripTraveler? TripTraveler { get; set; }

    /// <summary>True if the caller is authenticated as a participant (token originated as plantour participant token).</summary>
    public bool IsParticipant { get; set; }
}

public class PlantourAuthService : IPlantourAuthService
{
    private readonly PlantourContext _db;
    private readonly IClerkAuthService _clerk;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IConfiguration _configuration;
    private readonly string _plantourJwtSecret;
    private readonly JwtSecurityTokenHandler _jwtHandler = new();

    public PlantourCurrentUser CurrentUser { get; private set; } = new PlantourCurrentUser();

    public PlantourAuthService(PlantourContext db, IClerkAuthService clerk, IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
    {
        _db = db;
        _clerk = clerk;
        _httpContextAccessor = httpContextAccessor;
        _configuration = configuration;

        _plantourJwtSecret = configuration["PLANTOUR_JWT_SECRET"] ?? throw new InvalidOperationException("PLANTOUR_JWT_SECRET is required in configuration.");

        // Resolve current user from HttpContext when service is constructed in request scope.
        ResolveCurrentUserFromContextAsync().ConfigureAwait(false).GetAwaiter().GetResult();
    }

    private async Task ResolveCurrentUserFromContextAsync()
    {
        var ctx = _httpContextAccessor.HttpContext;
        if (ctx == null)
            return;

        // If middleware saved TripTravelerId in Items, load it
        if (ctx.Items.TryGetValue("Plantour.TripTravelerId", out var ttIdObj) && ttIdObj is Guid ttId)
        {
            var tt = await _db.TripTravelers.Include(x => x.Traveler).FirstOrDefaultAsync(x => x.Id == ttId);
            CurrentUser.TripTraveler = tt;
            CurrentUser.Traveler = tt?.Traveler;
            CurrentUser.IsParticipant = true;
        }
        else
        {
            CurrentUser.IsParticipant = false;
        }

        // Try to resolve Clerk admin user id & email (from IClerkAuthService.CurrentUser or from claims)
        string? clerkUserId = _clerk.CurrentUser?.ClerkUserId;
        string? clerkEmail = _clerk.CurrentUser?.Email;

        if (string.IsNullOrEmpty(clerkUserId))
        {
            var httpUser = ctx.User;
            if (httpUser?.Identity?.IsAuthenticated == true)
            {
                clerkUserId = httpUser.FindFirst("sub")?.Value ?? httpUser.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                clerkEmail = httpUser.FindFirst("email")?.Value;
            }
        }

        if (!string.IsNullOrEmpty(clerkUserId))
        {
            CurrentUser.AdminClerkUserId = clerkUserId;
            CurrentUser.AdminEmail = clerkEmail;

            try
            {
                var adminTraveler = await _db.Travelers.FirstOrDefaultAsync(t => t.UserId == clerkUserId);
                if (adminTraveler != null)
                {
                    CurrentUser.Traveler ??= adminTraveler;
                }
            }
            catch
            {
                // ignore mapping errors if DB schema differs
            }
        }
    }

    public async Task<string> RegisterParticipantAsync(Guid adminTravelerId, Guid tripId, string? email = null, string? firstName = null, string? lastName = null, string? phone = null, string? adminClerkToken = null)
    {
        // Create traveler entry (participant linked to admin)
        var traveler = new Traveler
        {
            Id = Guid.NewGuid(),
            AdminId = adminTravelerId,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            Phone = phone
        };

        await _db.Travelers.AddAsync(traveler);

        // Create TripTraveler with generated access code
        var accessCode = await GenerateUniqueAccessCodeForTripAsync(tripId);
        var tripTraveler = new TripTraveler
        {
            Id = Guid.NewGuid(),
            TripId = tripId,
            TravelerId = traveler.Id,
            AccessCode = accessCode
        };

        await _db.TripTravelers.AddAsync(tripTraveler);
        await _db.SaveChangesAsync();

        // Return the created access code to be delivered to participant by admin
        return accessCode;
    }

    private async Task<string> GenerateUniqueAccessCodeForTripAsync(Guid tripId)
    {
        string code;
        var tries = 0;
        do
        {
            code = AccessCodeGenerator.GenerateParticipantCode(8);
            tries++;
            // ensure uniqueness globally (DB has unique index on access_code)
        } while (await _db.TripTravelers.AnyAsync(tt => tt.AccessCode == code) && tries < 50);

        return code;
    }

    public async Task<string> GenerateAccessCodeAsync(Guid tripTravelerId)
    {
        var tt = await _db.TripTravelers.FirstOrDefaultAsync(x => x.Id == tripTravelerId) ?? throw new InvalidOperationException("TripTraveler not found.");
        tt.AccessCode = AccessCodeGenerator.GenerateParticipantCode(8);
        await _db.SaveChangesAsync();
        return tt.AccessCode;
    }

    public async Task<string> ResetAccessCodeAsync(Guid tripTravelerId)
    {
        // Reset (regenerate) access code
        return await GenerateAccessCodeAsync(tripTravelerId);
    }

    public async Task<string> LoginWithAccessCodeAsync(string accessCode, string? adminClerkToken = null)
    {
        var tt = await _db.TripTravelers.Include(x => x.Traveler).FirstOrDefaultAsync(x => x.AccessCode == accessCode);
        if (tt == null)
            throw new KeyNotFoundException("Invalid access code.");

        // If adminSupabaseToken provided, optionally validate format and embed it into plantour token
        string participantToken = await GenerateParticipantTokenAsync(tt, adminClerkToken);

        return participantToken;
    }

    public async Task<string> GenerateParticipantTokenAsync(TripTraveler tripTraveler, string? adminClerkToken = null)
    {
        var keyBytes = Encoding.UTF8.GetBytes(_plantourJwtSecret);
        var signingKey = new SymmetricSecurityKey(keyBytes);
        var signingCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        EncryptingCredentials? encryptingCredentials = null;
        var encSecret = _configuration["PLANTOUR_JWT_ENC_SECRET"];
        if (!string.IsNullOrEmpty(encSecret))
        {
            var encKeyBytes = Encoding.UTF8.GetBytes(encSecret);
            var encKey = new SymmetricSecurityKey(encKeyBytes);
            encryptingCredentials = new EncryptingCredentials(encKey, SecurityAlgorithms.Aes256KW, SecurityAlgorithms.Aes256CbcHmacSha512);
        }

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, tripTraveler.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("plantour_participant", "1"),
            new Claim("trip_id", tripTraveler.TripId.ToString()),
            new Claim("traveler_id", tripTraveler.TravelerId.ToString())
        };

        if (tripTraveler.Traveler != null && tripTraveler.Traveler.AdminId != Guid.Empty)
        {
            claims.Add(new Claim("admin_traveler_id", tripTraveler.Traveler.AdminId.ToString()));
        }
        else if (!string.IsNullOrEmpty(CurrentUser?.AdminClerkUserId))
        {
            claims.Add(new Claim("admin_clerk_user_id", CurrentUser.AdminClerkUserId));
        }

        if (!string.IsNullOrEmpty(adminClerkToken))
        {
            claims.Add(new Claim("admin_token", adminClerkToken));
        }

        var issuer = _configuration["PLANTOUR_TOKEN_ISSUER"] ?? "plantour";
        var audience = _configuration["PLANTOUR_TOKEN_AUDIENCE"] ?? "plantour-participants";

        var expiresInDays = 7;
        if (int.TryParse(_configuration["PLANTOUR_TOKEN_EXP_DAYS"], out var configuredDays))
            expiresInDays = configuredDays;

        var now = DateTime.UtcNow;
        var expires = now.AddDays(expiresInDays);

        SecurityToken token;
        if (encryptingCredentials != null)
        {
            var identity = new ClaimsIdentity(claims);
            token = _jwtHandler.CreateJwtSecurityToken(
                issuer: issuer,
                audience: audience,
                subject: identity,
                notBefore: now,
                expires: expires,
                issuedAt: now,
                signingCredentials: signingCredentials,
                encryptingCredentials: encryptingCredentials
            );
        }
        else
        {
            token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                notBefore: now,
                expires: expires,
                signingCredentials: signingCredentials
            );
        }

        return _jwtHandler.WriteToken(token);
    }
}
