using System;
using System.Threading;
using System.Threading.Tasks;
using Plantour.Infrastructure.Dtos;
using Plantour.Models;

namespace Plantour.Services;

public interface ITourService
{
    Task<Tour> CreateAsync(CreateTourRequest request, CancellationToken cancellationToken = default);
    Task<Tour?> GetAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Tour> ApplyPatchAsync(Guid id, ApplyTourPatchRequest request, CancellationToken cancellationToken = default);
}
