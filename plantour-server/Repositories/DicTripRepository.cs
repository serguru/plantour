using Microsoft.EntityFrameworkCore;
using Npgsql;
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
        if (CurrentUser == null || !packageIds.Any())
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

        int insertedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.insert_trip_user_packages(@adminId, @participantId, @tripId, @packageIds);";
                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
                command.Parameters.Add(new NpgsqlParameter("@participantId", participantId));
                command.Parameters.Add(new NpgsqlParameter("@tripId", tripId));
                command.Parameters.Add(new NpgsqlParameter("@packageIds", packageIds));
                var result = await command.ExecuteScalarAsync();
                if (result != null && int.TryParse(result.ToString(), out int count))
                {
                    insertedCount = count;
                }
            }
        }
        return insertedCount;
    }

    /// <summary>
    /// Deletes trip user packages from user packages.
    /// Calls the plantour.delete_trip_user_packages stored procedure.
    /// </summary>
    /// <param name="adminId">The admin user ID</param>
    /// <param name="participantId">The participant user ID</param>
    /// <param name="tripId">The trip ID</param>
    /// <param name="packageIds">Array of user package IDs to delete</param>
    /// <returns>Number of inserted records</returns>
    public async Task<int> DeleteTripUserPackagesAsync(
        Guid tripId,
        Guid[] packageIds)
    {
        if (CurrentUser == null || !packageIds.Any())
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

        int deletedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.delete_trip_user_packages(@adminId, @participantId, @tripId, @packageIds);";
                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
                command.Parameters.Add(new NpgsqlParameter("@participantId", participantId));
                command.Parameters.Add(new NpgsqlParameter("@tripId", tripId));
                command.Parameters.Add(new NpgsqlParameter("@packageIds", packageIds));
                var result = await command.ExecuteScalarAsync();
                if (result != null && int.TryParse(result.ToString(), out int count))
                {
                    deletedCount = count;
                }
            }
        }
        return deletedCount;
    }

    /// <summary>
    /// Inserts trip user things from user things.
    /// Calls the plantour.insert_trip_user_things stored procedure.
    /// </summary>
    /// <param name="adminId">The admin user ID</param>
    /// <param name="participantId">The participant user ID</param>
    /// <param name="tripId">The trip ID</param>
    /// <param name="thingIds">Array of user thing IDs to add</param>
    /// <returns>Number of inserted records</returns>
    public async Task<int> InsertTripUserThingsAsync(
        Guid tripId,
        Guid[] thingIds)
    {
        if (CurrentUser == null || !thingIds.Any())
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

        int insertedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.insert_trip_user_things(@adminId, @participantId, @tripId, @thingIds);";
                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
                command.Parameters.Add(new NpgsqlParameter("@participantId", participantId));
                command.Parameters.Add(new NpgsqlParameter("@tripId", tripId));
                command.Parameters.Add(new NpgsqlParameter("@thingIds", thingIds));
                var result = await command.ExecuteScalarAsync();
                if (result != null && int.TryParse(result.ToString(), out int count))
                {
                    insertedCount = count;
                }
            }
        }
        return insertedCount;
    }

    /// <summary>
    /// Deletes trip user things from user things.
    /// Calls the plantour.delete_trip_user_things stored procedure.
    /// </summary>
    /// <param name="adminId">The admin user ID</param>
    /// <param name="participantId">The participant user ID</param>
    /// <param name="tripId">The trip ID</param>
    /// <param name="thingIds">Array of user package IDs to delete</param>
    /// <returns>Number of inserted records</returns>
    public async Task<int> DeleteTripUserThingsAsync(
        Guid tripId,
        Guid[] thingIds)
    {
        if (CurrentUser == null || !thingIds.Any())
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

        int deletedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.delete_trip_user_things(@adminId, @participantId, @tripId, @thingIds);";
                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
                command.Parameters.Add(new NpgsqlParameter("@participantId", participantId));
                command.Parameters.Add(new NpgsqlParameter("@tripId", tripId));
                command.Parameters.Add(new NpgsqlParameter("@thingIds", thingIds));
                var result = await command.ExecuteScalarAsync();
                if (result != null && int.TryParse(result.ToString(), out int count))
                {
                    deletedCount = count;
                }
            }
        }
        return deletedCount;
    }

}
