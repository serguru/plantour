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

    public async Task<AdminsParticipant?> GetByParticipantIdAsync(Guid participantId)
    {
        if (CurrentUser == null)
        {
            return null;
        }
        return await _dbSet
            .Include(x => x.Admin)
            .FirstOrDefaultAsync(x => x.AdminId == CurrentUser.UserId && x.ParticipantId == participantId);
    }

    public async Task<bool> AnyByParticipantIdAsync(Guid participantId)
    {
        if (CurrentUser == null)
        {
            return false;
        }

        return await _dbSet
            .AnyAsync(x => x.AdminId == CurrentUser.UserId && x.ParticipantId == participantId);
    }

    public async Task<bool> AnyByParticipantEmailAsync(string email)
    {
        if (CurrentUser == null)
        {
            return false;
        }

        return await _dbSet
            .AnyAsync(x => x.AdminId == CurrentUser.UserId && x.Participant.Email == email);
    }
    
    public virtual async Task AddAsync(AdminsParticipant entity)
    {
        if (CurrentUser == null)
        {
            throw new InvalidOperationException("Access denied");
        }
        entity.AdminId = CurrentUser.UserId!.Value;
        _context.AdminsParticipants.Add(entity);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            // Handle unique constraint violation
            if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE constraint failed"))
            {
                throw new InvalidOperationException("Participant with the same email already exists");
            }
            throw;
        }
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

    public async Task<bool> AnyByAccessCode(string code)
    {
        return await _dbSet
            .AnyAsync(x => x.AccessCode == code);
    }

    public async Task<AdminsParticipant?> GetByAccessCodeAsync(string code)
    {
        return await _dbSet
            .Include(ap => ap.Participant)
            .Include(ap => ap.Admin)
            .FirstOrDefaultAsync(ap => ap.AccessCode == code);
    }
}
