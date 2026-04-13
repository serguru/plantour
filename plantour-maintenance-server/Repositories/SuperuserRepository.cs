using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_maintenance_server.Repositories;

public class SuperuserRepository(PlantourContext context) : GenericRepository<Superuser>(context)
{
    public async Task<IReadOnlyList<Superuser>> GetAllOrderedAsync()
    {
        return await DbSet
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync();
    }

    public async Task<Superuser?> GetByEmailAsync(string email)
    {
        return await DbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Email.ToLower() == email.ToLower());
    }

    public async Task<Superuser?> GetByIdTrackedAsync(Guid id)
    {
        return await DbSet.FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<string> HashPasswordAsync(string password, CancellationToken cancellationToken = default)
    {
        await Context.Database.OpenConnectionAsync(cancellationToken);

        try
        {
            await using var command = Context.Database.GetDbConnection().CreateCommand();
            command.CommandText = "select plantour.hash_superuser_password(@password)";

            var parameter = command.CreateParameter();
            parameter.ParameterName = "@password";
            parameter.Value = password;
            command.Parameters.Add(parameter);

            var result = await command.ExecuteScalarAsync(cancellationToken);
            if (result is not string hash || string.IsNullOrWhiteSpace(hash))
            {
                throw new InvalidOperationException("Password hash function returned no value.");
            }

            return hash;
        }
        finally
        {
            await Context.Database.CloseConnectionAsync();
        }
    }
}