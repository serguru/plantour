using System.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class DicTripRepository(PlantourContext context)
{
    private readonly PlantourContext _context = context;

    private async Task<int> ExecuteCountFunctionAsync(string commandText, params NpgsqlParameter[] parameters)
    {
        var connection = _context.Database.GetDbConnection();
        var shouldCloseConnection = connection.State != ConnectionState.Open;

        if (shouldCloseConnection)
        {
            await _context.Database.OpenConnectionAsync();
        }

        try
        {
            using var command = connection.CreateCommand();
            command.CommandText = commandText;

            foreach (var parameter in parameters)
            {
                command.Parameters.Add(parameter);
            }

            var result = await command.ExecuteScalarAsync();
            return result != null && int.TryParse(result.ToString(), out var count) ? count : 0;
        }
        finally
        {
            if (shouldCloseConnection)
            {
                await _context.Database.CloseConnectionAsync();
            }
        }
    }

    public async Task<int> InsertTripUserPackagesAsync(Guid adminId, Guid participantId, Guid tripId, Guid[] packageIds)
    {
        if (!packageIds.Any())
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.insert_trip_user_packages(@adminId, @participantId, @tripId, @packageIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@participantId", participantId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@packageIds", packageIds));
    }

    public async Task<int> DeleteTripUserPackagesAsync(Guid adminId, Guid participantId, Guid tripId, Guid[] packageIds)
    {
        if (!packageIds.Any())
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.delete_trip_user_packages(@adminId, @participantId, @tripId, @packageIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@participantId", participantId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@packageIds", packageIds));
    }

    public async Task<int> InsertTripUserThingsAsync(Guid adminId, Guid participantId, Guid tripId, Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.insert_trip_user_things(@adminId, @participantId, @tripId, @thingIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@participantId", participantId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@thingIds", thingIds));
    }

    public async Task<int> DeleteTripUserThingsAsync(Guid adminId, Guid participantId, Guid tripId, Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.delete_trip_user_things(@adminId, @participantId, @tripId, @thingIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@participantId", participantId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@thingIds", thingIds));
    }

    public async Task<int> InsertTripUserTodosAsync(Guid adminId, Guid participantId, Guid tripId, Guid[] todoIds)
    {
        if (todoIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.insert_trip_user_todos(@adminId, @participantId, @tripId, @todoIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@participantId", participantId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@todoIds", todoIds));
    }

    public async Task<int> DeleteTripUserTodosAsync(Guid adminId, Guid participantId, Guid tripId, Guid[] todoIds)
    {
        if (todoIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.delete_trip_user_todos(@adminId, @participantId, @tripId, @todoIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@participantId", participantId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@todoIds", todoIds));
    }

    public async Task<int> InsertTripUsersAsync(Guid adminId, Guid tripId, Guid[] adminParticipantIds)
    {
        if (adminParticipantIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.insert_trip_users(@adminId, @tripId, @adminParticipantIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@adminParticipantIds", adminParticipantIds));
    }

    public async Task<int> DeleteTripUsersAsync(Guid adminId, Guid tripId, Guid[] adminParticipantIds)
    {
        if (adminParticipantIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.delete_trip_users(@adminId, @tripId, @adminParticipantIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@adminParticipantIds", adminParticipantIds));
    }

    public async Task<int> PackTripThingsAsync(Guid adminId, Guid participantId, Guid tripId, Guid packageId, Guid[] tripThingIds, bool unpack)
    {
        if (tripThingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.pack_trip_things(@adminId, @participantId, @tripId, @packageId, @tripThingIds, @unpack);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@participantId", participantId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@packageId", packageId),
            new NpgsqlParameter("@tripThingIds", tripThingIds),
            new NpgsqlParameter("@unpack", unpack));
    }

    public async Task<int> InsertTripSharedThingsAsync(Guid adminId, Guid tripId, Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.insert_trip_shared_things(@adminId, @tripId, @thingIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@thingIds", thingIds));
    }

    public async Task<int> DeleteTripSharedThingsAsync(Guid adminId, Guid tripId, Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.delete_trip_shared_things(@adminId,  @tripId, @thingIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@thingIds", thingIds));
    }

    public async Task<int> InsertTripSharedTodosAsync(Guid adminId, Guid tripId, Guid[] todoIds)
    {
        if (todoIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.insert_trip_shared_todos(@adminId, @tripId, @todoIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@todoIds", todoIds));
    }

    public async Task<int> DeleteTripSharedTodosAsync(Guid adminId, Guid tripId, Guid[] todoIds)
    {
        if (todoIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.delete_trip_shared_todos(@adminId, @tripId, @todoIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@todoIds", todoIds));
    }

    public async Task<int> InsertTemplateTripSharedThingsAsync(Guid adminId, Guid tripId, Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.insert_template_trip_shared_things(@adminId, @tripId, @thingIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@thingIds", thingIds));
    }

    public async Task<int> InsertTemplateAiTripSharedThingsAsync(Guid adminId, Guid tripId, Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.insert_template_ai_trip_shared_things(@adminId, @tripId, @thingIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@thingIds", thingIds));
    }

    public async Task<int> DeleteTemplateTripSharedThingsAsync(Guid adminId, Guid tripId, Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.delete_template_trip_shared_things(@adminId,  @tripId, @thingIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@thingIds", thingIds));
    }

    public async Task<int> DeleteTemplateAiTripSharedThingsAsync(Guid adminId, Guid tripId, Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.delete_template_ai_trip_shared_things(@adminId,  @tripId, @thingIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@thingIds", thingIds));
    }

    public async Task<int> InsertTemplateTripUserThingsAsync(Guid adminId, Guid participantId, Guid tripId, Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.insert_template_trip_user_things(@adminId, @participantId, @tripId, @thingIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@participantId", participantId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@thingIds", thingIds));
    }

    public async Task<int> InsertTemplateAiTripUserThingsAsync(Guid adminId, Guid participantId, Guid tripId, Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.insert_template_ai_trip_user_things(@adminId, @participantId, @tripId, @thingIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@participantId", participantId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@thingIds", thingIds));
    }

    public async Task<int> DeleteTemplateTripUserThingsAsync(Guid adminId, Guid participantId, Guid tripId, Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.delete_template_trip_user_things(@adminId, @participantId, @tripId, @thingIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@participantId", participantId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@thingIds", thingIds));
    }

    public async Task<int> DeleteTemplateAiTripUserThingsAsync(Guid adminId, Guid participantId, Guid tripId, Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.delete_template_ai_trip_user_things(@adminId, @participantId, @tripId, @thingIds);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@participantId", participantId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@thingIds", thingIds));
    }

    public async Task<int> InsertTemplateUserThingsAsync(Guid userId, Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.insert_template_user_things(@userId, @thingIds);",
            new NpgsqlParameter("@userId", userId),
            new NpgsqlParameter("@thingIds", thingIds));
    }

    public async Task<int> InsertTemplateAiUserThingsAsync(Guid userId, Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.insert_template_ai_user_things(@userId, @thingIds);",
            new NpgsqlParameter("@userId", userId),
            new NpgsqlParameter("@thingIds", thingIds));
    }

    public async Task<int> DeleteTemplateUserThingsAsync(Guid userId, Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.delete_template_user_things(@userId, @thingIds);",
            new NpgsqlParameter("@userId", userId),
            new NpgsqlParameter("@thingIds", thingIds));
    }

    public async Task<int> DeleteTemplateAiUserThingsAsync(Guid userId, Guid[] thingIds)
    {
        if (thingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.delete_template_ai_user_things(@userId, @thingIds);",
            new NpgsqlParameter("@userId", userId),
            new NpgsqlParameter("@thingIds", thingIds));
    }

    public async Task<int> AssignTripSharedThingsAsync(Guid adminId, Guid tripId, Guid tripUserId, Guid[] tripSharedThingIds, DateTime? deadlineAt, bool unassign)
    {
        if (tripSharedThingIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.assign_trip_shared_things(@adminId, @tripId, @tripUserId, @tripSharedThingIds, @deadlineAt, @unassign);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@tripUserId", tripUserId),
            new NpgsqlParameter("@tripSharedThingIds", tripSharedThingIds),
            new NpgsqlParameter("@deadlineAt", deadlineAt ?? (object)DBNull.Value),
            new NpgsqlParameter("@unassign", unassign));
    }

    public async Task<int> AssignTripSharedTodosAsync(Guid adminId, Guid tripId, Guid tripUserId, Guid[] tripSharedTodoIds, DateTime? deadlineAt, bool unassign)
    {
        if (tripSharedTodoIds.Length == 0)
        {
            return 0;
        }

        return await ExecuteCountFunctionAsync(
            "SELECT plantour_v2.assign_trip_shared_todos(@adminId, @tripId, @tripUserId, @tripSharedTodoIds, @deadlineAt, @unassign);",
            new NpgsqlParameter("@adminId", adminId),
            new NpgsqlParameter("@tripId", tripId),
            new NpgsqlParameter("@tripUserId", tripUserId),
            new NpgsqlParameter("@tripSharedTodoIds", tripSharedTodoIds),
            new NpgsqlParameter("@deadlineAt", deadlineAt ?? (object)DBNull.Value),
            new NpgsqlParameter("@unassign", unassign));
    }

    public async Task<int> AssignTripSharedExpensesAsync(Guid adminId, Guid tripId, Guid tripUserId, Guid[] tripSharedExpenseIds, DateTime? deadlineAt, bool unassign)
    {
        if (tripSharedExpenseIds.Length == 0)
        {
            return 0;
        }

        var query = _context.TripSharedExpenses.Where(x =>
            x.TripId == tripId &&
            x.Trip.UserId == adminId &&
            tripSharedExpenseIds.Contains(x.Id));

        if (unassign)
        {
            return await query.ExecuteUpdateAsync(setters => setters
                .SetProperty(x => x.AssignedToId, x => null)
                .SetProperty(x => x.AssignedExpenseId, x => null)
                .SetProperty(x => x.AssignedAt, x => null)
                .SetProperty(x => x.AssignedDeadline, x => null)
                .SetProperty(x => x.Rejected, x => false));
        }

        return await query.ExecuteUpdateAsync(setters => setters
            .SetProperty(x => x.AssignedToId, x => tripUserId)
            .SetProperty(x => x.AssignedExpenseId, x => null)
            .SetProperty(x => x.AssignedAt, x => DateTime.UtcNow)
            .SetProperty(x => x.AssignedDeadline, x => deadlineAt)
            .SetProperty(x => x.Rejected, x => false));
    }
}



