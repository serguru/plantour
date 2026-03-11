using AutoMapper;
using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;
using PlantourApi.Models;

namespace plantour_server.Repositories;

public class TripRepository(PlantourContext context) : GenericRepository<Trip>(context)
{
    public async Task<IEnumerable<Trip>> GetAllFullAsync(CurrentUser currentUser)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(x => x.TripStatus)
            .Include(x => x.TripUsers)
                .ThenInclude(x => x.AdminParticipant)
            .Include(x => x.TripUsers)
                .ThenInclude(x => x.TripUserPackages)
                    .ThenInclude(x => x.TripUserThings)
            .Include(x => x.TripUsers)
                    .ThenInclude(x => x.TripUserThings)
            .Include(x => x.TripSharedThings)
                    .ThenInclude(x => x.AssignedTo)
                        .ThenInclude(x => x != null ? x.AdminParticipant : null)
            .Include(x => x.TripSharedThings)
                    .ThenInclude(x => x.AssignedThing)
            .Where
            (t =>
                t.UserId == currentUser.AdminId &&
                (
                    currentUser.IsAdmin ||
                    currentUser.IsParticipant &&
                        t.TripUsers.Any(x => x.AdminParticipant.AdminId == currentUser.AdminId &&
                            x.AdminParticipant.ParticipantId == currentUser.UserId)

                )

            )
            .ToListAsync();
    }


    public async Task<Trip?> GetByIdFullAsync(CurrentUser currentUser, Guid id)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(x => x.TripStatus)
            .Include(x => x.TripUsers)
                .ThenInclude(x => x.AdminParticipant)
            .Include(x => x.TripUsers)
                .ThenInclude(x => x.TripUserPackages)
                    .ThenInclude(x => x.TripUserThings)
            .Include(x => x.TripUsers)
                    .ThenInclude(x => x.TripUserThings)
            .Include(x => x.TripSharedThings)
                    .ThenInclude(x => x.AssignedTo)
                        .ThenInclude(x => x != null ? x.AdminParticipant : null)
            .Include(x => x.TripSharedThings)
                    .ThenInclude(x => x.AssignedThing)

            .FirstOrDefaultAsync(t =>
                t.Id == id &&
                t.UserId == currentUser.AdminId &&
                (
                    currentUser.IsAdmin ||
                    currentUser.IsParticipant &&
                        t.TripUsers.Any(x => x.AdminParticipant.AdminId == currentUser.AdminId &&
                            x.AdminParticipant.ParticipantId == currentUser.UserId)

                )
            );
    }
}
