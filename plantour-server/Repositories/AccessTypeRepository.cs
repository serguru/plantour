using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class AccessTypeRepository : GenericRepository<AccessType>
{

    public AccessTypeRepository(PlantourContext context) : base(context)
    {
    }

    public async Task<AccessType?> GetByName(string name)
    {
        return await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Name == name);
    }

    public override async Task<AccessType?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<Guid> GetActiveId()
    {
        var activity = await GetByName("Active");
        return activity?.Id ?? throw new InvalidOperationException("Active not found");
    }

    public async Task<Guid> GetPendingId()
    {
        var pending = await GetByName("Pending");
        return pending?.Id ?? throw new InvalidOperationException("Pending not found");
    }

}