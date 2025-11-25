using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Plantour.Models;
using Plantour.Utils;
using Supabase.Gotrue;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Plantour.Services;

public interface IPlantourAuthService
{
    /// <summary>
    /// Current user context. Contains the admin supabase user (if available) and the current Plantour traveler/trip-traveler (if participant).
    /// </summary>
    PlantourCurrentUser CurrentUser { get; }

    /// <summary>
    /// Register a new participant traveler and attach to the given trip (creates TripTraveler with access code).
    /// Returns the created access code.
    /// </summary>
    Task<string> RegisterParticipantAsync(Guid adminTravelerId, Guid tripId, string? email = null, string? firstName = null, string? lastName = null, string? phone = null, string? adminSupabaseToken = null);

    /// <summary>
    /// Login using an access code. If adminSupabaseToken is provided it will be embedded into participant token.
    /// Returns JWT (Plantour token) that contains embedded admin token (under claim "admin_token").
    /// </summary>
    Task<string> LoginWithAccessCodeAsync(string accessCode, string? adminSupabaseToken = null);

    /// <summary>
    /// Regenerate access code for given TripTraveler and return new code.
    /// </summary>
    Task<string> ResetAccessCodeAsync(Guid tripTravelerId);

    /// <summary>
    /// Generate a new Plantour JWT for specified TripTraveler (optionally embedding adminSupabaseToken).
    /// </summary>
    Task<string> GenerateParticipantTokenAsync(TripTraveler tripTraveler, string? adminSupabaseToken = null);

    /// <summary>
    /// Generate an access code and persist it for the TripTraveler entity.
    /// </summary>
    Task<string> GenerateAccessCodeAsync(Guid tripTravelerId);
}

/// <summary>
/// Container for current caller info resolved by PlantourAuthService.
/// </summary>
public sealed class PlantourCurrentUser
{
    /// <summary>Supabase admin user (decoded or null if not available).</summary>
    public User? AdminSupabaseUser { get; set; }

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
    private readonly ISupabaseAuthService _supabase;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IConfiguration _configuration;
    private readonly string _plantourJwtSecret;
    private readonly JwtSecurityTokenHandler _jwtHandler = new();

    public PlantourCurrentUser CurrentUser { get; private set; } = new PlantourCurrentUser();

    public PlantourAuthService(PlantourContext db, ISupabaseAuthService supabase, IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
    {
        _db = db;
        _supabase = supabase;
        _httpContextAccessor = httpContextAccessor;
        _configuration = configuration;

        _plantourJwtSecret = configuration["PLANTOUR_JWT_SECRET"] ?? throw new InvalidOperationException("PLANTOUR_JWT_SECRET is required in configuration.");

        // Resolve current user from HttpContext when service is constructed in request scope.
        // It's acceptable to call async resolution synchronously here as it's a small DB fetch.
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

        // Try to get supabase current user from SupabaseAuthService
        var supUser = _supabase.GetCurrentUser();
        if (supUser != null)
        {
            CurrentUser.AdminSupabaseUser = supUser;
            // try to map to traveler record for admin (if exists)
            if (Guid.TryParse(supUser.Id, out var supId))
            {
                var adminTraveler = await _db.Travelers.FirstOrDefaultAsync(t => t.UserId == supId);
                if (adminTraveler != null)
                {
                    CurrentUser.Traveler ??= adminTraveler;
                }
            }
        }
        else
        {
            // if no supabase client user, try to read some claims from HttpContext.User (may be present after middleware swap)
            var httpUser = ctx.User;
            if (httpUser?.Identity?.IsAuthenticated == true)
            {
                var sub = httpUser.FindFirst("sub")?.Value;
                var email = httpUser.FindFirst("email")?.Value;
                if (!string.IsNullOrEmpty(sub) || !string.IsNullOrEmpty(email))
                {
                    try
                    {
                        CurrentUser.AdminSupabaseUser = new User
                        {
                            Id = sub,
                            Email = email
                        };
                    }
                    catch
                    {
                        // ignore if User construction is not compatible; admin user is optional here
                    }
                }
            }
        }
    }

    public async Task<string> RegisterParticipantAsync(Guid adminTravelerId, Guid tripId, string? email = null, string? firstName = null, string? lastName = null, string? phone = null, string? adminSupabaseToken = null)
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

    public async Task<string> LoginWithAccessCodeAsync(string accessCode, string? adminSupabaseToken = null)
    {
        var tt = await _db.TripTravelers.Include(x => x.Traveler).FirstOrDefaultAsync(x => x.AccessCode == accessCode);
        if (tt == null)
            throw new KeyNotFoundException("Invalid access code.");

        // If adminSupabaseToken provided, optionally validate format and embed it into plantour token
        string participantToken = await GenerateParticipantTokenAsync(tt, adminSupabaseToken);

        return participantToken;
    }

    public async Task<string> GenerateParticipantTokenAsync(TripTraveler tripTraveler, string? adminSupabaseToken = null)
    {
        // Build participant token (signed with PLANTOUR_JWT_SECRET). It includes a claim "admin_token" containing the admin's supabase token (if provided).
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_plantourJwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, tripTraveler.Id.ToString()),
            new Claim("plantour_participant", "1"),
            new Claim("trip_id", tripTraveler.TripId.ToString()),
            new Claim("traveler_id", tripTraveler.TravelerId.ToString()),
            new Claim("admin_traveler_id", tripTraveler.Traveler?.AdminId?.ToString() ?? string.Empty)
        };

        if (!string.IsNullOrEmpty(adminSupabaseToken))
        {
            claims.Add(new Claim("admin_token", adminSupabaseToken));
        }

        var expiresInDays = 7;
        if (int.TryParse(_configuration["PLANTOUR_TOKEN_EXP_DAYS"], out var configuredDays))
            expiresInDays = configuredDays;

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expiresInDays),
            signingCredentials: creds);

        return _jwtHandler.WriteToken(token);
    }
}
