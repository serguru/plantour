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
        var packingStatuses = await _lookupsRepository.GetAllPackingStatusesAsync();
        var communicationTypes = await _lookupsRepository.GetAllCommunicationTypesAsync();
        var thingCategories = await _lookupsRepository.GetAllThingCategoriesAsync();
        var tripStatuses = await _lookupsRepository.GetAllTripStatusesAsync();
        var participantStatuses = await _lookupsRepository.GetAllParticipantStatusesAsync();
        var units = await _lookupsRepository.GetAllUnitsAsync();

        return new LookupsResponse
        {
            PackingStatuses = _mapper.Map<IEnumerable<PackingStatusDto>>(packingStatuses),
            CommunicationTypes = _mapper.Map<IEnumerable<CommunicationTypeDto>>(communicationTypes),
            ThingCategories = _mapper.Map<IEnumerable<ThingCategoryDto>>(thingCategories),
            TripStatuses = _mapper.Map<IEnumerable<TripStatusDto>>(tripStatuses),
            ParticipantStatuses = _mapper.Map<IEnumerable<ParticipantStatusDto>>(participantStatuses),
            Units = _mapper.Map<IEnumerable<UnitDto>>(units)
        };
    }
}
