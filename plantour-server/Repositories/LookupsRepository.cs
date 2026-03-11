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
        return await _context.CommunicationTypes
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<ThingCategory>> GetAllThingCategoriesAsync()
    {
        return await _context.ThingCategories
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<TripStatus>> GetAllTripStatusesAsync()
    {
        return await _context.TripStatuses
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<Unit>> GetAllUnitsAsync()
    {
        return await _context.Units
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync();
    }
}
