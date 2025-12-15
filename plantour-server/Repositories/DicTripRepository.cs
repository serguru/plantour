using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class DicTripRepository : BaseRepository
{
    private readonly PlantourContext _context;
    public DicTripRepository(PlantourContext context, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
    {
        _context = context;
    }

    /// <summary>
    /// Inserts trip user packages from user packages.
    /// Calls the plantour.insert_trip_user_packages stored procedure.
    /// </summary>
    /// <param name="adminId">The admin user ID</param>
    /// <param name="participantId">The participant user ID</param>
    /// <param name="tripId">The trip ID</param>
    /// <param name="packageIds">Array of user package IDs to add</param>
    /// <returns>Number of inserted records</returns>
    public async Task<int> InsertTripUserPackagesAsync(
        Guid tripId,
        Guid[] packageIds)
    {
        if (CurrentUser == null)
        {
            return 0;
        }

        Guid adminId, participantId;

        if (CurrentUser.IsAdmin)
        {
            adminId = CurrentUser.UserId!.Value;
            participantId = adminId;
        }
        else if (CurrentUser.IsParticipant)
        {
            adminId = CurrentUser.AdminId!.Value;
            participantId = CurrentUser.UserId!.Value;
        }
        else
        {
            return 0;
        }   

        var result = await _context.Database.ExecuteSqlInterpolatedAsync(
            $"SELECT plantour.insert_trip_user_packages({adminId}, {participantId}, {tripId}, {packageIds})");
        
        return result;
    }

}
