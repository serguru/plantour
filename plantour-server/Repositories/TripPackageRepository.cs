using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripPackageRepository(PlantourContext context) : GenericRepository<TripUserPackage>(context)
{

    public async Task<TripUserPackage?> GetByIdAsync(Guid adminId, Guid userId, Guid tripId, Guid id)
    {
        return await _dbSet
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.TripUser.Trip.Id == tripId &&
                x.TripUser.Trip.UserId == adminId &&
                x.TripUser.AdminParticipant.AdminId == adminId &&
                x.TripUser.AdminParticipant.ParticipantId == userId);
    }

    public async Task<bool> AnyByIdAsync(Guid adminId, Guid userId, Guid tripId, Guid id)
    {
        return await _dbSet
            .AnyAsync(x =>
                x.Id == id &&
                x.TripUser.Trip.Id == tripId &&
                x.TripUser.Trip.UserId == adminId &&
                x.TripUser.AdminParticipant.AdminId == adminId &&
                x.TripUser.AdminParticipant.ParticipantId == userId);
    }

    public async Task<IEnumerable<TripUserPackage>> GetAllAsync(Guid adminId, Guid userId, Guid tripId)
    {
        return await _dbSet
            .Where(x =>
                x.TripUser.Trip.Id == tripId &&
                x.TripUser.Trip.UserId == adminId &&
                x.TripUser.AdminParticipant.AdminId == adminId &&
                x.TripUser.AdminParticipant.ParticipantId == userId)
            .ToListAsync();
    }

    // public async Task AddAsync(Guid tripId, TripUserPackage entity)
    // {
    //     if (CurrentUser == null)
    //     {
    //         throw new InvalidOperationException("Access denied");
    //     }

    //     TripUser? tripUser = null;

    //     if (CurrentUser.IsAdmin)
    //     {
    //         tripUser = await _context.TripUsers
    //             .FirstOrDefaultAsync(x =>
    //                 x.Trip.UserId == CurrentUser.UserId &&
    //                 x.AdminParticipant.AdminId == CurrentUser.UserId &&
    //                 x.AdminParticipant.ParticipantId == CurrentUser.UserId
    //                 );
    //     }

    //     if (CurrentUser.IsParticipant)
    //     {
    //         tripUser = await _context.TripUsers
    //             .FirstOrDefaultAsync(x =>
    //                 x.Trip.UserId == CurrentUser.AdminId &&
    //                 x.AdminParticipant.AdminId == CurrentUser.AdminId &&
    //                 x.AdminParticipant.ParticipantId == CurrentUser.UserId
    //                 );
    //     }

    //     if (tripUser == null)
    //     {
    //         throw new InvalidOperationException("Access denied");
    //     }

    //     entity.Id = Guid.NewGuid();
    //     entity.TripUserId = tripUser.Id;
    //     _context.TripUserPackages.Add(entity);
    //     await _context.SaveChangesAsync();
    // }

    // public async Task UpdateAsync(TripUserPackage entity)
    // {
    //     if (CurrentUser == null)
    //     {
    //         throw new InvalidOperationException("Access denied");
    //     }

    //     var existingEntity = await GetByIdAsync(entity.Id);
    //     if (existingEntity == null)
    //     {
    //         throw new InvalidOperationException("TripUserPackage not found");
    //     }

    //     _context.TripUserPackages.Attach(entity);
    //     _context.Entry(entity).State = EntityState.Modified;
    //     await _context.SaveChangesAsync();
    // }

    // public async Task DeleteAsync(Guid id)
    // {
    //     if (CurrentUser == null)
    //     {
    //         throw new InvalidOperationException("Access denied");
    //     }

    //     var entity = await GetByIdAsync(id);
    //     if (entity == null)
    //     {
    //         return;
    //     }

    //     _context.TripUserPackages.Remove(entity);
    //     await _context.SaveChangesAsync();
    // }
}
