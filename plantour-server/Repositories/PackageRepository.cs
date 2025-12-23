using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class PackageRepository : BaseRepository
{

    private readonly DbSet<UserPackage> _dbSet;
    private readonly PlantourContext _context;

    public PackageRepository(PlantourContext context, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
    {
        _dbSet = context.Set<UserPackage>();
        _context = context;
    }

    public async Task<UserPackage?> GetByIdAsync(Guid id)
    {
        if (CurrentUser == null)
        {
            return null;
        }
        return await _dbSet
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == CurrentUser.UserId);
    }

    public async Task<UserPackage?> GetByNameAsync(string name)
    {
        if (CurrentUser == null)
        {
            return null;
        }
        return await _dbSet
            .FirstOrDefaultAsync(x => x.Name == name && x.UserId == CurrentUser.UserId);
    }

    public async Task<IEnumerable<UserPackage>> GetAllAsync()
    {
        if (CurrentUser == null)
        {
            return Array.Empty<UserPackage>();
        }

        return await _dbSet
            .Where(x => x.UserId == CurrentUser.UserId)
            .ToListAsync();
    }

    public virtual async Task AddAsync(UserPackage entity)
    {
        if (CurrentUser == null)
        {
            throw new InvalidOperationException("Access denied");
        }
        var existingEntity = await GetByNameAsync(entity.Name);
        if (existingEntity != null)
        {
            throw new InvalidOperationException("Package with the same description already exists");
        }
        entity.Id = Guid.NewGuid();
        entity.UserId = CurrentUser.UserId;
        _context.UserPackages.Add(entity);
        await _context.SaveChangesAsync();
    }

    public virtual async Task UpdateAsync(UserPackage entity)
    {
        var existingEntity = await GetByIdAsync(entity.Id);
        if (existingEntity == null || existingEntity.UserId != CurrentUser!.UserId)
        {
            throw new InvalidOperationException("User package not found or access denied");
        }
        _context.UserPackages.Attach(entity);
        _context.Entry(entity).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public virtual async Task DeleteAsync(Guid id)
    {
        var entity = await GetByIdAsync(id);
        if (entity == null || entity.UserId != CurrentUser!.UserId)
        {
            return;
        }
        _context.UserPackages.Remove(entity);
        await _context.SaveChangesAsync();
    }
}
