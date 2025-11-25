using Microsoft.EntityFrameworkCore;
using Plantour.Models;

namespace Plantour.Services;

public interface ITripService
{
    Task<object?> GetTrip(Guid tripId);
}

public class TripService : ITripService
{
    private readonly PlantourContext _db;

    public TripService(PlantourContext db)
    {
        _db = db;
    }

    public async Task<object?> GetTrip(Guid tripId)
    {
        var trip = await _db.Trips
            // базовые навигации
            .Include(t => t.Owner)
            .Include(t => t.TripStatus)

            // trip_travelers + travelers
            .Include(t => t.TripTravelers)
                .ThenInclude(tt => tt.Traveler)

            // trip_travelers + trip_traveler_things
            .Include(t => t.TripTravelers)
                .ThenInclude(tt => tt.TripTravelerThings)

            // trip_traveler_things -> traveler_thing
            .Include(t => t.TripTravelers)
                .ThenInclude(tt => tt.TripTravelerThings)
                    .ThenInclude(ttt => ttt.TravelerThing)

            // trip_traveler_things -> packing_status
            .Include(t => t.TripTravelers)
                .ThenInclude(tt => tt.TripTravelerThings)
                    .ThenInclude(ttt => ttt.PackingStatus)

            // trip_traveler_things -> traveler_package
            .Include(t => t.TripTravelers)
                .ThenInclude(tt => tt.TripTravelerThings)
                    .ThenInclude(ttt => ttt.TravelerPackage)

            .FirstOrDefaultAsync(t => t.Id == tripId);

        if (trip == null)
            return null;

        var json = new
        {
            // сам trip – только простые поля, без навигаций
            trip.Id,
            trip.OwnerId,
            trip.TripStatusId,
            trip.ShortDescription,
            trip.Description,
            trip.StartDate,
            trip.EndDate,
            trip.RequireWeight,

            // владелец (owner)
            owner = trip.Owner == null ? null : new
            {
                trip.Owner.Id,
                trip.Owner.UserId,
                trip.Owner.AdminId,
                trip.Owner.FirstName,
                trip.Owner.LastName,
                trip.Owner.Email,
                trip.Owner.Phone,
                trip.Owner.Notes
            },

            // статус путешествия
            trip_status = trip.TripStatus == null ? null : new
            {
                trip.TripStatus.Id,
                trip.TripStatus.Name,
                trip.TripStatus.Notes
            },

            // trip_travelers с вложенными travelers и trip_traveler_things
            trip_travelers = trip.TripTravelers.Select(tt => new
            {
                tt.Id,
                tt.TripId,
                tt.TravelerId,
                tt.AccessCode,

                // traveler, на которого ссылается trip_travelers
                traveler = tt.Traveler == null ? null : new
                {
                    tt.Traveler.Id,
                    tt.Traveler.UserId,
                    tt.Traveler.AdminId,
                    tt.Traveler.FirstName,
                    tt.Traveler.LastName,
                    tt.Traveler.Email,
                    tt.Traveler.Phone,
                    tt.Traveler.Notes
                },

                // trip_traveler_things с вложенными traveler_thing, packing_status и traveler_package
                trip_traveler_things = tt.TripTravelerThings.Select(x => new
                {
                    x.Id,
                    x.TripTravelerId,
                    x.TravelerThingId,
                    x.TravelerPackageId,
                    x.PackingStatusId,
                    x.PackedAt,

                    // traveler_thing, на которого ссылается trip_traveler_things
                    traveler_thing = x.TravelerThing == null ? null : new
                    {
                        x.TravelerThing.Id,
                        x.TravelerThing.CategoryId,
                        x.TravelerThing.ShortDescription,
                        x.TravelerThing.Description,
                        x.TravelerThing.Brand,
                        x.TravelerThing.Model,
                        x.TravelerThing.Color,
                        x.TravelerThing.WeightValue,
                        x.TravelerThing.WeightUnitId,
                        x.TravelerThing.LengthValue,
                        x.TravelerThing.WidthValue,
                        x.TravelerThing.HeightValue,
                        x.TravelerThing.DimensionUnitId,
                        x.TravelerThing.PurchaseDate,
                        x.TravelerThing.PurchasePrice,
                        x.TravelerThing.PurchaseCurrencyId
                    },

                    // packing_status
                    packing_status = x.PackingStatus == null ? null : new
                    {
                        x.PackingStatus.Id,
                        x.PackingStatus.Name,
                        x.PackingStatus.Notes
                    },

                    // traveler_package
                    traveler_package = x.TravelerPackage == null ? null : new
                    {
                        x.TravelerPackage.Id,
                        x.TravelerPackage.CategoryId,
                        x.TravelerPackage.ParentPackageId,
                        x.TravelerPackage.ShortDescription,
                        x.TravelerPackage.Description,
                        x.TravelerPackage.Brand,
                        x.TravelerPackage.Model,
                        x.TravelerPackage.Color,
                        x.TravelerPackage.EmptyWeightValue,
                        x.TravelerPackage.WeightUnitId,
                        x.TravelerPackage.CapacityValue,
                        x.TravelerPackage.CapacityUnitId,
                        x.TravelerPackage.LengthValue,
                        x.TravelerPackage.WidthValue,
                        x.TravelerPackage.HeightValue,
                        x.TravelerPackage.DimensionUnitId
                    }
                })
            })
        };

        return json;
    }
}
