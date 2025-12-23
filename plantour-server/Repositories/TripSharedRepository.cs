using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripAssignRepository(
    PlantourContext context,
    IHttpContextAccessor httpContextAccessor,
    TripRepository tripRepository,
    TripUserRepository tripUserRepository,
    TripThingRepository tripThingRepository
    ) : BaseRepository(httpContextAccessor)
{
    private readonly DbSet<TripSharedThing> _dbSet = context.Set<TripSharedThing>();
    private readonly PlantourContext _context = context;
    private readonly TripRepository _tripRepository = tripRepository;
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
    private readonly TripThingRepository _tripThingRepository = tripThingRepository;

    // Rule 1. No users including admins can change AddedById and AddedAt. If admin is not happy with who added it, they can delete and re-add.
    // Rule 2. Admins have full access to all trip shared things except Rule 1.
    // Rule 3. Participants:
    // - have full access to shared things they added except Rule 1.
    // - can accept / reject shared things assigned to them
    // - cannot set AssignedToId to other users even if they added the shared thing


    public async Task<TripSharedThing?> GetByIdAsync(Guid tripId, Guid id)
    {
        if (CurrentUser == null)
        {
            return null;
        }

        Guid? adminId = null;
        if (CurrentUser.IsAdmin)
        {
            adminId = CurrentUser.UserId;
        } else if (CurrentUser.IsParticipant)
        {
            adminId = CurrentUser.AdminId;
        } else 
        {
            return null;
        }  

        return await _dbSet
            .Include(x => x.AddedBy)
            .Include(x => x.AssignedTo)
            .Include(x => x.AssignedThing)
            .FirstOrDefaultAsync(x =>
                x.TripId == tripId &&
                x.Id == id &&
                x.Trip.UserId == CurrentUser.UserId &&
                x.AddedBy.AdminParticipant.AdminId == adminId &&
                (
                    x.AssignedTo == null ||
                    x.AssignedTo.AdminParticipant.AdminId == adminId
                ) &&
                (
                    x.AssignedThing == null ||
                    x.AssignedThing.TripUser.AdminParticipant.AdminId == adminId
                )
            );

    }

    public async Task<IEnumerable<TripSharedThing>> GetAllAsync(Guid tripId)
    {
        if (CurrentUser == null)
        {
            return Array.Empty<TripSharedThing>();
        }

        Guid? adminId = null;
        if (CurrentUser.IsAdmin)
        {
            adminId = CurrentUser.UserId;
        } else if (CurrentUser.IsParticipant)
        {
            adminId = CurrentUser.AdminId;
        } else 
        {
            return Array.Empty<TripSharedThing>();
        }

        return await _dbSet
            .Include(x => x.AddedBy)
            .Include(x => x.AssignedTo)
            .Include(x => x.AssignedThing)
            .Where(x =>
                x.TripId == tripId &&
                x.Trip.UserId == CurrentUser.UserId &&
                x.AddedBy.AdminParticipant.AdminId == adminId &&
                (
                    x.AssignedTo == null ||
                    x.AssignedTo.AdminParticipant.AdminId == adminId
                ) &&
                (
                    x.AssignedThing == null ||
                    x.AssignedThing.TripUser.AdminParticipant.AdminId == adminId
                )
            ).ToListAsync();

    }

    public async Task<bool> AnyByNameAsync(Guid tripId, string name, Guid? excludingId = null)
    {
        return await _dbSet.AnyAsync(x =>
            x.TripId == tripId &&
            x.Name.Equals(name, StringComparison.OrdinalIgnoreCase) &&
            (excludingId == null || x.Id != excludingId)
        );
    }

    public async Task AddAsync(TripSharedThing entity)
    {
        if (!await _tripRepository.AnyByIdAsync(entity.TripId))
        {
            throw new InvalidOperationException("Trip not found");
        }   

        if (await AnyByNameAsync(entity.TripId, entity.Name))
        {
            throw new InvalidOperationException("A shared thing with the same name already exists in this trip");
        }

        if (entity.AssignedToId != null && !await _tripUserRepository.AnyByIdAsync(entity.AssignedToId.Value, entity.TripId))
        {
            throw new InvalidOperationException("Assigned to user not found in this trip");
        }   

        entity.Id = Guid.NewGuid();
        entity.AddedById = CurrentUser!.UserId!.Value;
        entity.AssignedThingId = null;
        entity.AssignedAt = null;
        _dbSet.Add(entity);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(TripSharedThing entity)
    {
        var existingEntity = await GetByIdAsync(entity.Id, entity.TripId);
        if (existingEntity == null)
        {
            throw new InvalidOperationException("Shared thing not found");
        }

        if (await AnyByNameAsync(entity.TripId, entity.Name, entity.Id))
        {
            throw new InvalidOperationException("A shared thing with the same name already exists in this trip");
        }

        if (entity.TripId != existingEntity.TripId)
        {
            throw new InvalidOperationException("Cannot change the trip of the shared thing");
        }

        if (entity.AddedById != existingEntity.AddedById)
        {
            throw new InvalidOperationException("Cannot change the AddedBy of the shared thing");
        }

        if (entity.AssignedToId != existingEntity.AssignedToId && !CurrentUser!.IsAdmin)
        {
            throw new InvalidOperationException("Only admins can change the AssignedTo of the shared thing");
        }

        if (entity.AssignedToId != existingEntity.AssignedToId && !CurrentUser!.IsAdmin)
        {
            throw new InvalidOperationException("Only admins can change the AssignedTo of the shared thing");
        }

        // If the reference to a participant thing removed
        if (entity.AssignedThingId == null && existingEntity.AssignedThingId != null &&
            !( CurrentUser!.IsParticipant || !await _tripThingRepository.AnyByIdAsync(entity.TripId, existingEntity.AssignedThingId!.Value) ))
        {
            throw new InvalidOperationException("Only admin or owner can remove the reference to a participant thing");
        }

        _dbSet.Attach(entity);
        _context.Entry(entity).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid tripId, Guid id)
    {
        if (CurrentUser == null)
        {
            throw new InvalidOperationException("Access denied");
        }

        var entity = await GetByIdAsync(tripId, id);
        if (entity == null)
        {
            return;
        }

        _dbSet.Remove(entity);
        await _context.SaveChangesAsync();
    }
}
