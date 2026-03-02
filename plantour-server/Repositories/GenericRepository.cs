using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;
using System.Linq.Expressions;

namespace plantour_server.Repositories;

public class GenericRepository<T> where T : class
{
    protected readonly PlantourContext _context;
    protected readonly DbSet<T> _dbSet;

    public GenericRepository(PlantourContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(Guid id)
    {
        return await _dbSet.FindAsync(id);
    }


    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.Where(predicate).ToListAsync();
    }

    public virtual async Task<T> AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public virtual async Task UpdateAsync(T entity)
    {
        _dbSet.Update(entity);
        await _context.SaveChangesAsync();
    }

    public virtual async Task DeleteAsync(Guid id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }

    public virtual async Task<int> DeleteRangeAsync(Expression<Func<T, bool>> predicate, CancellationToken token)
    {
        int totalDeleted = await _dbSet
                .Where(predicate)
                .ExecuteDeleteAsync(token);
        return totalDeleted;                
    }

    #region Any Methods
    public virtual async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.AnyAsync(predicate);
    }
    #endregion
}
