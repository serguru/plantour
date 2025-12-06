using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class AdminsParticipantRepository : BaseRepository
{

    private readonly DbSet<AdminsParticipant> _dbSet;
    private readonly PlantourContext _context;

    public AdminsParticipantRepository(PlantourContext context, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
    {
        _dbSet = context.Set<AdminsParticipant>();
        _context = context;
    }

    public async Task<AdminsParticipant?> GetByIdAsync(Guid id)
    {
        if (CurrentUser == null)
        {
            return null;
        }
        return await _dbSet     
            .FirstOrDefaultAsync(x => x.Id == id && x.AdminId == CurrentUser.UserId);
    }

    public async Task<AdminsParticipant?> GetByEmailAsync(string email)
    {
        if (CurrentUser == null)
        {
            return null;
        }
        return await _dbSet
            .FirstOrDefaultAsync(x => x.Email == email && x.AdminId == CurrentUser.UserId);
    }

    public async Task<IEnumerable<AdminsParticipant>> GetAllAsync()
    {
        if (CurrentUser == null)
        {
            return Array.Empty<AdminsParticipant>();
        }

        return await _dbSet
            .Where(x => x.AdminId == CurrentUser.UserId)
            .ToListAsync();
    }

    public virtual async Task AddAsync(AdminsParticipant entity)
    {
        if (CurrentUser == null)
        {
            throw new InvalidOperationException("Access denied");
        }
        var existingEntity = await GetByEmailAsync(entity.Email);
        if (existingEntity != null)
        {
            throw new InvalidOperationException("Participant with the same email already exists");
        }
        _context.AdminsParticipants.Add(entity);
        await _context.SaveChangesAsync();
    }

    public virtual async Task UpdateAsync(AdminsParticipant entity)
    {
        var existingEntity = await GetByIdAsync(entity.Id);
        if (existingEntity == null || existingEntity.AdminId != CurrentUser!.UserId)
        {
            throw new InvalidOperationException("Participant not found or access denied");
        }
        _context.AdminsParticipants.Attach(entity);
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
        _context.AdminsParticipants.Remove(entity);
        await _context.SaveChangesAsync();
    }
}
