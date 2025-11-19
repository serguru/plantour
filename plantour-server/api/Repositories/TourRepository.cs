using Microsoft.EntityFrameworkCore;
using Plantour.Models;

namespace Plantour.Repositories;

public class TourRepository : ITourRepository
{
    private readonly PlantourContext _context;

    public TourRepository(PlantourContext context)
    {
        _context = context;
    }

    public async Task<Tour?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Tours
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<Tour> AddAsync(Tour tour, CancellationToken cancellationToken = default)
    {
        _context.Tours.Add(tour);
        await _context.SaveChangesAsync(cancellationToken);
        return tour;
    }

    public async Task<Tour> UpdateAsync(Tour tour, CancellationToken cancellationToken = default)
    {
        _context.Tours.Update(tour);
        await _context.SaveChangesAsync(cancellationToken);
        return tour;
    }
}
