using Microsoft.EntityFrameworkCore;
using Npgsql;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class DicTripRepository(PlantourContext context)
{
    private readonly PlantourContext _context = context;

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

        Guid adminId,
        Guid participantId,
        Guid tripId,
        Guid[] packageIds)
    {
        if (!packageIds.Any())
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
        Guid adminId,
        Guid participantId,
        Guid tripId,
        Guid[] packageIds)
    {
        if (!packageIds.Any())
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

    public async Task<int> InsertTripUserThingsAsync(
        Guid adminId,
        Guid participantId,
        Guid tripId,
        Guid[] thingIds)
    {
        if (thingIds.Length == 0)
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

    public async Task<int> DeleteTripUserThingsAsync(
        Guid adminId,
        Guid participantId,
        Guid tripId,
        Guid[] thingIds)
    {
        if (thingIds.Length == 0)
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

    public async Task<int> InsertTripUserTodosAsync(
        Guid adminId,
        Guid participantId,
        Guid tripId,
        Guid[] todoIds)
    {
        if (todoIds.Length == 0)
        {
            return 0;
        }

        int insertedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.insert_trip_user_todos(@adminId, @participantId, @tripId, @todoIds);";
                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
                command.Parameters.Add(new NpgsqlParameter("@participantId", participantId));
                command.Parameters.Add(new NpgsqlParameter("@tripId", tripId));
                command.Parameters.Add(new NpgsqlParameter("@todoIds", todoIds));
                var result = await command.ExecuteScalarAsync();
                if (result != null && int.TryParse(result.ToString(), out int count))
                {
                    insertedCount = count;
                }
            }
        }
        return insertedCount;
    }

    public async Task<int> DeleteTripUserTodosAsync(
        Guid adminId,
        Guid participantId,
        Guid tripId,
        Guid[] todoIds)
    {
        if (todoIds.Length == 0)
        {
            return 0;
        }

        int deletedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.delete_trip_user_todos(@adminId, @participantId, @tripId, @todoIds);";
                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
                command.Parameters.Add(new NpgsqlParameter("@participantId", participantId));
                command.Parameters.Add(new NpgsqlParameter("@tripId", tripId));
                command.Parameters.Add(new NpgsqlParameter("@todoIds", todoIds));
                var result = await command.ExecuteScalarAsync();
                if (result != null && int.TryParse(result.ToString(), out int count))
                {
                    deletedCount = count;
                }
            }
        }
        return deletedCount;
    }

    public async Task<int> InsertTripUsersAsync(
        Guid adminId,
        Guid tripId,
        Guid[] adminParticipantIds)
    {
        if (adminParticipantIds.Length == 0)
        {
            return 0;
        }

        int insertedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.insert_trip_users(@adminId, @tripId, @adminParticipantIds);";
                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
                command.Parameters.Add(new NpgsqlParameter("@tripId", tripId));
                command.Parameters.Add(new NpgsqlParameter("@adminParticipantIds", adminParticipantIds));
                var result = await command.ExecuteScalarAsync();
                if (result != null && int.TryParse(result.ToString(), out int count))
                {
                    insertedCount = count;
                }
            }
        }
        return insertedCount;
    }

    public async Task<int> DeleteTripUsersAsync(
        Guid adminId,
        Guid tripId,
        Guid[] adminParticipantIds)
    {
        if (adminParticipantIds.Length == 0)
        {
            return 0;
        }

        int deletedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.delete_trip_users(@adminId, @tripId, @adminParticipantIds);";
                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
                command.Parameters.Add(new NpgsqlParameter("@tripId", tripId));
                command.Parameters.Add(new NpgsqlParameter("@adminParticipantIds", adminParticipantIds));
                var result = await command.ExecuteScalarAsync();
                if (result != null && int.TryParse(result.ToString(), out int count))
                {
                    deletedCount = count;
                }
            }
        }
        return deletedCount;
    }

    public async Task<int> PackTripThingsAsync(
        Guid adminId,
        Guid participantId,
        Guid tripId,
        Guid packageId,
        Guid[] tripThingIds,
        bool unpack
        )
    {
        if (tripThingIds.Length == 0)
        {
            return 0;
        }

        int updatedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.pack_trip_things(@adminId, @participantId, @tripId, @packageId, @tripThingIds, @unpack);";

                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
                command.Parameters.Add(new NpgsqlParameter("@participantId", participantId));
                command.Parameters.Add(new NpgsqlParameter("@tripId", tripId));
                command.Parameters.Add(new NpgsqlParameter("@packageId", packageId));
                command.Parameters.Add(new NpgsqlParameter("@tripThingIds", tripThingIds));
                command.Parameters.Add(new NpgsqlParameter("@unpack", unpack));
                var result = await command.ExecuteScalarAsync();
                if (result != null && int.TryParse(result.ToString(), out int count))
                {
                    updatedCount = count;
                }
            }
        }
        return updatedCount;
    }

    public async Task<int> InsertTripSharedThingsAsync(
        Guid adminId,
        Guid tripId,
        Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        int insertedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.insert_trip_shared_things(@adminId, @tripId, @thingIds);";
                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
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

    public async Task<int> DeleteTripSharedThingsAsync(
        Guid adminId,
        Guid tripId,
        Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        int deletedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.delete_trip_shared_things(@adminId,  @tripId, @thingIds);";
                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
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

    public async Task<int> InsertTripSharedTodosAsync(
        Guid adminId,
        Guid tripId,
        Guid[] todoIds)
    {
        if (todoIds.Length == 0)
        {
            return 0;
        }

        int insertedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.insert_trip_shared_todos(@adminId, @tripId, @todoIds);";
                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
                command.Parameters.Add(new NpgsqlParameter("@tripId", tripId));
                command.Parameters.Add(new NpgsqlParameter("@todoIds", todoIds));
                var result = await command.ExecuteScalarAsync();
                if (result != null && int.TryParse(result.ToString(), out int count))
                {
                    insertedCount = count;
                }
            }
        }
        return insertedCount;
    }

    public async Task<int> DeleteTripSharedTodosAsync(
        Guid adminId,
        Guid tripId,
        Guid[] todoIds)
    {
        if (todoIds.Length == 0)
        {
            return 0;
        }

        int deletedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.delete_trip_shared_todos(@adminId, @tripId, @todoIds);";
                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
                command.Parameters.Add(new NpgsqlParameter("@tripId", tripId));
                command.Parameters.Add(new NpgsqlParameter("@todoIds", todoIds));
                var result = await command.ExecuteScalarAsync();
                if (result != null && int.TryParse(result.ToString(), out int count))
                {
                    deletedCount = count;
                }
            }
        }
        return deletedCount;
    }


    //-----------------------------------

    public async Task<int> InsertTemplateTripSharedThingsAsync(
        Guid adminId,
        Guid tripId,
        Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        int insertedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.insert_template_trip_shared_things(@adminId, @tripId, @thingIds);";
                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
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


    public async Task<int> InsertTemplateAiTripSharedThingsAsync(
        Guid adminId,
        Guid tripId,
        Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        int insertedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.insert_template_ai_trip_shared_things(@adminId, @tripId, @thingIds);";
                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
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


    public async Task<int> DeleteTemplateTripSharedThingsAsync(
        Guid adminId,
        Guid tripId,
        Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        int deletedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.delete_template_trip_shared_things(@adminId,  @tripId, @thingIds);";
                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
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

    public async Task<int> DeleteTemplateAiTripSharedThingsAsync(
        Guid adminId,
        Guid tripId,
        Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        int deletedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.delete_template_ai_trip_shared_things(@adminId,  @tripId, @thingIds);";
                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
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


    public async Task<int> InsertTemplateTripUserThingsAsync(
        Guid adminId,
        Guid participantId,
        Guid tripId,
        Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        int insertedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.insert_template_trip_user_things(@adminId, @participantId, @tripId, @thingIds);";
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

    public async Task<int> InsertTemplateAiTripUserThingsAsync(
        Guid adminId,
        Guid participantId,
        Guid tripId,
        Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        int insertedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.insert_template_ai_trip_user_things(@adminId, @participantId, @tripId, @thingIds);";
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


    public async Task<int> DeleteTemplateTripUserThingsAsync(
        Guid adminId,
        Guid participantId,
        Guid tripId,
        Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        int deletedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.delete_template_trip_user_things(@adminId, @participantId, @tripId, @thingIds);";
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

    public async Task<int> DeleteTemplateAiTripUserThingsAsync(
        Guid adminId,
        Guid participantId,
        Guid tripId,
        Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        int deletedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.delete_template_ai_trip_user_things(@adminId, @participantId, @tripId, @thingIds);";
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


    public async Task<int> InsertTemplateUserThingsAsync(
        Guid userId,
        Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        int insertedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.insert_template_user_things(@userId, @thingIds);";
                command.Parameters.Add(new NpgsqlParameter("@userId", userId));
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

    public async Task<int> InsertTemplateAiUserThingsAsync(
        Guid userId,
        Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        int insertedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.insert_template_ai_user_things(@userId, @thingIds);";
                command.Parameters.Add(new NpgsqlParameter("@userId", userId));
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


    public async Task<int> DeleteTemplateUserThingsAsync(
        Guid userId,
        Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        int deletedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.delete_template_user_things(@userId, @thingIds);";
                command.Parameters.Add(new NpgsqlParameter("@userId", userId));
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

    public async Task<int> DeleteTemplateAiUserThingsAsync(
        Guid userId,
        Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        int deletedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.delete_template_ai_user_things(@userId, @thingIds);";
                command.Parameters.Add(new NpgsqlParameter("@userId", userId));
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


    public async Task<int> AssignTripSharedThingsAsync(
        Guid adminId,
        Guid tripId,
        Guid tripUserId,
        Guid[] tripSharedThingIds,
        DateTime? deadlineAt,
        bool unassign
        )
    {
        if (tripSharedThingIds.Length == 0)
        {
            return 0;
        }

        object d = deadlineAt.HasValue ? deadlineAt.Value : DBNull.Value;

        int updatedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.assign_trip_shared_things(@adminId, @tripId, @tripUserId, @tripSharedThingIds, @deadlineAt, @unassign);";

                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
                command.Parameters.Add(new NpgsqlParameter("@tripId", tripId));
                command.Parameters.Add(new NpgsqlParameter("@tripUserId", tripUserId));
                command.Parameters.Add(new NpgsqlParameter("@tripSharedThingIds", tripSharedThingIds));
                command.Parameters.Add(new NpgsqlParameter("@deadlineAt", d));
                command.Parameters.Add(new NpgsqlParameter("@unassign", unassign));
                var result = await command.ExecuteScalarAsync();
                if (result != null && int.TryParse(result.ToString(), out int count))
                {
                    updatedCount = count;
                }
            }
        }
        return updatedCount;
    }

    public async Task<int> AssignTripSharedTodosAsync(
        Guid adminId,
        Guid tripId,
        Guid tripUserId,
        Guid[] tripSharedTodoIds,
        DateTime? deadlineAt,
        bool unassign
        )
    {
        if (tripSharedTodoIds.Length == 0)
        {
            return 0;
        }

        object d = deadlineAt.HasValue ? deadlineAt.Value : DBNull.Value;

        int updatedCount = 0;
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT plantour.assign_trip_shared_todos(@adminId, @tripId, @tripUserId, @tripSharedTodoIds, @deadlineAt, @unassign);";

                command.Parameters.Add(new NpgsqlParameter("@adminId", adminId));
                command.Parameters.Add(new NpgsqlParameter("@tripId", tripId));
                command.Parameters.Add(new NpgsqlParameter("@tripUserId", tripUserId));
                command.Parameters.Add(new NpgsqlParameter("@tripSharedTodoIds", tripSharedTodoIds));
                command.Parameters.Add(new NpgsqlParameter("@deadlineAt", d));
                command.Parameters.Add(new NpgsqlParameter("@unassign", unassign));
                var result = await command.ExecuteScalarAsync();
                if (result != null && int.TryParse(result.ToString(), out int count))
                {
                    updatedCount = count;
                }
            }
        }
        return updatedCount;
    }
}



