using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class AuthRepository : BaseRepository
{

    private readonly DbSet<User> _dbSet;
    private readonly PlantourContext _context;

    public AuthRepository(PlantourContext context, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
    {
        _dbSet = context.Set<User>();
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _dbSet     
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet
            .FirstOrDefaultAsync(x => x.Email == email);
    }

    public async Task<bool> AnyByEmailAsync(string email)
    {
        return await _dbSet
            .AnyAsync(x => x.Email == email);
    }


 

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        if (CurrentUser == null)
        {
            return Array.Empty<User>();
        }

        return await _dbSet
            .ToListAsync();
    }

    public async Task AddAsync(User entity)
    {
        entity.Id = Guid.NewGuid();
        _context.Users.Add(entity);
        await _context.SaveChangesAsync();
    }

    public virtual async Task UpdateAsync(User entity)
    {
        var existingEntity = await GetByIdAsync(entity.Id);
        if (existingEntity == null)
        {
            throw new InvalidOperationException("User not found");
        }
        _context.Users.Attach(entity);
        _context.Entry(entity).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public virtual async Task DeleteAsync(Guid id)
    {
        var entity = await GetByIdAsync(id);
        if (entity == null)
        {
            return;
        }
        _context.Users.Remove(entity);
        await _context.SaveChangesAsync();
    }
}
