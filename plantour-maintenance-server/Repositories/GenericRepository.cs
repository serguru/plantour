using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;
using System.Linq.Expressions;

namespace plantour_maintenance_server.Repositories;

public class GenericRepository<T>(PlantourContext context) where T : class
{
    protected readonly PlantourContext Context = context;
    protected readonly DbSet<T> DbSet = context.Set<T>();

    public virtual async Task<T?> GetByIdAsync(Guid id)
    {
        return await DbSet.FindAsync(id);
    }

    public virtual async Task<IReadOnlyList<T>> GetAllAsync()
    {
        return await DbSet.ToListAsync();
    }

    public virtual async Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate)
    {
        return await DbSet.Where(predicate).ToListAsync();
    }
}