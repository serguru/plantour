using AutoMapper;
using Microsoft.Extensions.Caching.Hybrid;
using plantour_server.DTOs;
using plantour_server.Repositories;

namespace plantour_server.Services;

public class LookupsService : ILookupsService
{
    private const string LookupsCacheKey = "lookups:all:v1";

    private static readonly HybridCacheEntryOptions LookupsCacheEntryOptions = new()
    {
        Expiration = TimeSpan.FromMinutes(30),
        LocalCacheExpiration = TimeSpan.FromMinutes(10)
    };

    private readonly LookupsRepository _lookupsRepository;
    private readonly IMapper _mapper;
    private readonly HybridCache _cache;

    public LookupsService(LookupsRepository lookupsRepository, IMapper mapper, HybridCache cache)
    {
        _lookupsRepository = lookupsRepository;
        _mapper = mapper;
        _cache = cache;
    }

    public async Task<LookupsResponse> GetAllLookupsAsync()
    {
        return await _cache.GetOrCreateAsync(
            LookupsCacheKey,
            async cancel =>
            {
                var communicationTypes = await _lookupsRepository.GetAllCommunicationTypesAsync();
                var thingCategories = await _lookupsRepository.GetAllThingCategoriesAsync();
                var todoCategories = await _lookupsRepository.GetAllTodoCategoriesAsync();

                var tripStatusesRaw = await _lookupsRepository.GetAllTripStatusesAsync();

                List<string> statusNames = new()
                {
                    "Planning",
                    "Preparation",
                    "Active",
                    "Completed"
                };

                var tripStatuses = tripStatusesRaw
                    .OrderBy(x => statusNames.IndexOf(x.Name))
                    .ToList();

                var units = await _lookupsRepository.GetAllUnitsAsync();

                return new LookupsResponse
                {
                    CommunicationTypes = _mapper.Map<IEnumerable<CommunicationTypeDto>>(communicationTypes),
                    ThingCategories = _mapper.Map<IEnumerable<ThingCategoryDto>>(thingCategories),
                    TodoCategories = _mapper.Map<IEnumerable<TodoCategoryDto>>(todoCategories),
                    TripStatuses = _mapper.Map<IEnumerable<TripStatusDto>>(tripStatuses),
                    Units = _mapper.Map<IEnumerable<UnitDto>>(units)
                };
            },
            LookupsCacheEntryOptions,
            cancellationToken: default);
    }
}
