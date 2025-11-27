using Plantour.Models;
using Plantour.Utils;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Services
{
    /// <summary>
    /// Communication service for Plantour: sending invitations and other external communications.
    /// </summary>
    public interface ICommunicationService
    {
        /// <summary>
        /// Invite an existing traveler (invitee) to the specified trip.
        /// The method will:
        /// - validate trip exists and caller is the trip owner
        /// - validate invitee traveler has email, first_name and last_name
        /// - create TripTraveler entry with access code
        /// - generate participant token (embedding admin clerk token when available)
        /// - create an Invitation record with subject and message containing two links:
        ///     1) link with one-time participant token (auto-registration)
        ///     2) link for entering access code
        /// </summary>
        /// <param name="tripId">Trip id</param>
        /// <param name="iviteeId">Traveler id to invite</param>
        Task InviteTravelerToTrip(Guid tripId, Guid iviteeId);
    }

    public class CommunicationService : ICommunicationService
    {
        private readonly PlantourContext _db;
        private readonly IPlantourAuthService _plantourAuth;
        private readonly IClerkAuthService _clerk;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpAccessor;
        private readonly PlantourAuthService? _unusedForDI; // keep DI signature compatibility if necessary

        /// <summary>
        /// Creates a new instance of <see cref="CommunicationService"/>.
        /// </summary>
        public CommunicationService(
            PlantourContext db,
            IPlantourAuthService plantourAuth,
            IClerkAuthService clerk,
            IConfiguration configuration,
            IHttpContextAccessor httpContextAccessor,
            PlantourAuthService? unusedForDI = null)
        {
            _db = db ?? throw new ArgumentNullException(nameof(db));
            _plantourAuth = plantourAuth ?? throw new ArgumentNullException(nameof(plantourAuth));
            _clerk = clerk ?? throw new ArgumentNullException(nameof(clerk));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _httpAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _unusedForDI = unusedForDI;
        }

        /// <inheritdoc />
        public async Task InviteTravelerToTrip(Guid tripId, Guid iviteeId)
        {
            // Load trip and owner
            Trip? trip;
            try
            {
                trip = await _db.Trips
                    .Include(t => t.Owner)
                    .FirstOrDefaultAsync(t => t.Id == tripId);
            }
            catch (Exception e)
            {
                throw new Exception("!" + e.Message);
            }

            if (trip == null)
                throw new KeyNotFoundException($"Trip {tripId} not found.");

            // Resolve current Plantour user/traveler via IPlantourAuthService.CurrentUser
            var current = _plantourAuth.CurrentUser;
            if (current?.Traveler == null)
                throw new UnauthorizedAccessException("Current user is not authenticated as a Plantour traveler.");

            // Ensure current user is the trip owner (owner_id must match current user's traveler id)
            if (trip.OwnerId != current.Traveler.Id)
                throw new UnauthorizedAccessException("Only trip owner can invite participants to this trip.");

            // Load invitee traveler
            var invitee = await _db.Travelers.FirstOrDefaultAsync(t => t.Id == iviteeId);
            if (invitee == null)
                throw new KeyNotFoundException($"Traveler {iviteeId} not found.");

            // Ensure basic data present
            if (string.IsNullOrWhiteSpace(invitee.Email))
                throw new ArgumentException("Invitee has no email.", nameof(iviteeId));
            if (string.IsNullOrWhiteSpace(invitee.FirstName))
                throw new ArgumentException("Invitee has no first name.", nameof(iviteeId));
            if (string.IsNullOrWhiteSpace(invitee.LastName))
                throw new ArgumentException("Invitee has no last name.", nameof(iviteeId));

            // Generate unique access code for trip traveler
            var accessCode = await GenerateUniqueAccessCodeAsync();

            // Create TripTraveler record
            var tripTraveler = new TripTraveler
            {
                Id = Guid.NewGuid(),
                TripId = trip.Id,
                TravelerId = invitee.Id,
                AccessCode = accessCode
            };

            await _db.TripTravelers.AddAsync(tripTraveler);
            await _db.SaveChangesAsync();

            // Try to obtain current admin token to embed (read Authorization header first,
            // fallback to Clerk service CurrentUser if it exposes a token).
            string? adminClerkToken = null;

            try
            {
                var authHeader = _httpAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault();
                if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    adminClerkToken = authHeader.Substring("Bearer ".Length).Trim();
                }
            }
            catch
            {
                // ignore reading header failures - fallback attempts follow
            }

            if (string.IsNullOrEmpty(adminClerkToken))
            {
                // Attempt to read token from IClerkAuthService.CurrentUser if implementation stores it (optional).
                try
                {
                    var currentClerkUser = _clerk.GetType().GetProperty("CurrentUser")?.GetValue(_clerk);
                    var jwtProp = currentClerkUser?.GetType().GetProperty("ClerkJwt");
                    if (jwtProp != null)
                    {
                        adminClerkToken = jwtProp.GetValue(currentClerkUser) as string;
                    }
                }
                catch
                {
                    // ignore reflection failures; embedding admin token is optional
                }
            }

            // Generate participant token via PlantourAuthService (embeds admin clerk token if provided).
            // This token is used as one-time link for auto-registration/login.
            var participantToken = await _plantourAuth.GenerateParticipantTokenAsync(tripTraveler, adminClerkToken);

            // Compose subject and message
            var frontendBase = _configuration["PLANTOUR_FRONTEND_URL"]?.TrimEnd('/') ?? "https://app.plantour.local";

            var subject = $"Invitation: join trip \"{trip.ShortDescription}\"";

            var tokenLink = $"{frontendBase}/invite/accept?token={Uri.EscapeDataString(participantToken)}";
            var codeLink = $"{frontendBase}/invite/accept?access_code={Uri.EscapeDataString(accessCode)}&tripId={trip.Id}";

            var message = $@"Hello {invitee.FirstName} {invitee.LastName},

You were invited to join the trip ""{trip.ShortDescription}"" by {current.Traveler.FirstName} {current.Traveler.LastName}.

Two ways to join:
1) Click the link to join automatically (token-based): {tokenLink}
2) Or open Plantour and enter this access code to join: {accessCode}
   (manual entry link: {codeLink})

If you did not expect this invitation, ignore this message.

Best regards,
Plantour";

            // Create invitation record
            var invitation = new Invitation
            {
                Id = Guid.NewGuid(),
                TripId = trip.Id,
                InviterId = current.Traveler.Id,
                InviteeId = invitee.Id,
                InviteToken = Guid.NewGuid().ToString(), // a unique invite token (separate from participant token)
                AccessCode = accessCode,
                FirstName = invitee.FirstName,
                LastName = invitee.LastName,
                Email = invitee.Email,
                Phone = invitee.Phone,
                Subject = subject,
                Message = message,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                SentAt = DateTime.UtcNow
            };

            await _db.Invitations.AddAsync(invitation);
            await _db.SaveChangesAsync();

            // Note: actual email sending is out of scope here. The invitation record contains all info required.
        }

        private async Task<string> GenerateUniqueAccessCodeAsync()
        {
            var tries = 0;
            string code;
            do
            {
                code = AccessCodeGenerator.GenerateParticipantCode(8);
                tries++;
                // ensure uniqueness across trip_travelers.access_code (DB has unique index)
            } while (await _db.TripTravelers.AnyAsync(tt => tt.AccessCode == code) && tries < 50);

            if (tries >= 50 && await _db.TripTravelers.AnyAsync(tt => tt.AccessCode == code))
                throw new InvalidOperationException("Unable to generate a unique access code. Try again later.");

            return code;
        }
    }
}