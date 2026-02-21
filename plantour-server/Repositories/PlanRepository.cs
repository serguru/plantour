using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class PlanRepository : GenericRepository<Plan>
{

    public PlanRepository(PlantourContext context) : base(context)
    {
        
    }
    public async Task<IEnumerable<Plan>> GetAll()
    {
        return await _dbSet
        .Include(p => p.Prices)
        .ToListAsync();
    }

    public async Task<Plan?> GetByName(string name)
    {
        return await _dbSet.FirstOrDefaultAsync(x => x.Name == name);
    }

    public async Task<Guid> GetNoPlanId()
    {
        var plan = await GetByName("NoPlan");
        return plan?.Id ?? throw new InvalidOperationException("NoPlan not found");
    }



}