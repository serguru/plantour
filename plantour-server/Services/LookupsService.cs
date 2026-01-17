using AutoMapper;
using plantour_server.DTOs;
using plantour_server.Repositories;

namespace plantour_server.Services;

public class LookupsService : ILookupsService
{
    private readonly LookupsRepository _lookupsRepository;
    private readonly IMapper _mapper;

    public LookupsService(LookupsRepository lookupsRepository, IMapper mapper)
    {
        _lookupsRepository = lookupsRepository;
        _mapper = mapper;
    }

    public async Task<LookupsResponse> GetAllLookupsAsync()
    {
        var communicationTypes = await _lookupsRepository.GetAllCommunicationTypesAsync();
        var thingCategories = await _lookupsRepository.GetAllThingCategoriesAsync();

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
            TripStatuses = _mapper.Map<IEnumerable<TripStatusDto>>(tripStatuses),
            Units = _mapper.Map<IEnumerable<UnitDto>>(units)
        };
    }
}
