using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class LookupsRepository
{
    private readonly PlantourContext _context;

    public LookupsRepository(PlantourContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CommunicationType>> GetAllCommunicationTypesAsync()
    {
        return await _context.CommunicationTypes.OrderBy(x => x.Name).ToListAsync();
    }

    public async Task<IEnumerable<ThingCategory>> GetAllThingCategoriesAsync()
    {
        return await _context.ThingCategories.OrderBy(x => x.Name).ToListAsync();
    }

    public async Task<IEnumerable<TripStatus>> GetAllTripStatusesAsync()
    {
        return await _context.TripStatuses.OrderBy(x => x.Name).ToListAsync();
    }

    public async Task<IEnumerable<ParticipantStatus>> GetAllParticipantStatusesAsync()
    {
        return await _context.ParticipantStatuses.OrderBy(x => x.Name).ToListAsync();
    }

    public async Task<IEnumerable<Unit>> GetAllUnitsAsync()
    {
        return await _context.Units.OrderBy(x => x.Name).ToListAsync();
    }
}
