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

    public async Task<Trip?> GetByIdOrLatestFullAsync(CurrentUser currentUser, Guid? id)
    {
        Guid tripId = Guid.Empty;
        if (id == null)
        {
            var trip = await _dbSet
                .Include(x => x.TripStatus)
                .Where(x => x.TripStatus.Name != "Archived" && (x.UserId == currentUser.AdminId ||
                    x.TripUsers.Any(tu => tu.AdminParticipant.AdminId == currentUser.AdminId &&
                        tu.AdminParticipant.ParticipantId == currentUser.UserId)))
                .OrderByDescending(t => t.CreatedAt)
                .FirstOrDefaultAsync();

            if (trip == null)
            {
                return null;
            }           

            tripId = trip.Id;
        } else
        {
            tripId = id.Value;
        }

        return await GetByIdFullAsync(currentUser, tripId);
        
    }

    public async Task<Trip?> GetByIdFullAsync(CurrentUser currentUser, Guid id)
    {
        return await _dbSet
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
