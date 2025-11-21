using Microsoft.EntityFrameworkCore;
using Plantour.Models;

namespace Plantour.Services;

public interface ITourRepository
{
    Task<Tour?> GetAsync(Guid id);
    Task<List<Tour>> GetAllAsync();
    Task<Tour> AddAsync(string json);
    Task<Tour> UpdateAsync(Tour tour);
    Task DeleteAsync(Tour tour);
}

public class TourRepository : ITourRepository
{
    private readonly PlantourContext _db;

    public TourRepository(PlantourContext db)
    {
        _db = db;
    }

    public Task<Tour?> GetAsync(Guid id)
        => _db.Tours.FirstOrDefaultAsync(t => t.Id == id);

    public Task<List<Tour>> GetAllAsync()
        => _db.Tours.ToListAsync();

    public async Task<Tour> AddAsync(string json)
    {
        var t = new Tour { JsonObject = json };
        _db.Tours.Add(t);
        await _db.SaveChangesAsync();
        return t;
    }

    public async Task<Tour> UpdateAsync(Tour tour)
    {
        _db.Tours.Update(tour);
        await _db.SaveChangesAsync();
        return tour;
    }

    public async Task DeleteAsync(Tour tour)
    {
        _db.Tours.Remove(tour);
        await _db.SaveChangesAsync();
    }
}
