using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Plantour.Models;
using Plantour.Utils;

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
        /// - generate participant token (embedding admin supabase token when available)
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
        private readonly ISupabaseAuthService _supabase;
        private readonly IConfiguration _configuration;
        private readonly PlantourAuthService? _unusedForDI; // keep DI signature compatibility if necessary

        /// <summary>
        /// Creates a new instance of <see cref="CommunicationService"/>.
        /// </summary>
        public CommunicationService(
            PlantourContext db,
            IPlantourAuthService plantourAuth,
            ISupabaseAuthService supabase,
            IConfiguration configuration,
            PlantourAuthService? unusedForDI = null)
        {
            _db = db ?? throw new ArgumentNullException(nameof(db));
            _plantourAuth = plantourAuth ?? throw new ArgumentNullException(nameof(plantourAuth));
            _supabase = supabase ?? throw new ArgumentNullException(nameof(supabase));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
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
                throw new Exception("!"+e.Message);
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

            // Get admin supabase token to embed if available
            var adminSupabaseToken = _supabase.GetAccessToken();

            // Generate participant token via PlantourAuthService (embeds admin token if provided).
            // This token is used as one-time link for auto-registration/login.
            var participantToken = await _plantourAuth.GenerateParticipantTokenAsync(tripTraveler, adminSupabaseToken);

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