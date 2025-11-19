using Plantour.Models;

namespace Plantour.Repositories;

public interface ITourRepository
{
    Task<Tour?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Tour> AddAsync(Tour tour, CancellationToken cancellationToken = default);
    Task<Tour> UpdateAsync(Tour tour, CancellationToken cancellationToken = default);
}
