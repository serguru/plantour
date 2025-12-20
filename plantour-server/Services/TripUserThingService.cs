using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;

namespace plantour_server.Services;

public class TripUserThingService(
    TripUserThingRepository tripUserThingRepository,
    DicTripRepository dicTripRepository,
    IMapper mapper) : ITripUserThingService
{
    private readonly TripUserThingRepository _tripUserThingRepository = tripUserThingRepository;
    private readonly DicTripRepository _dicTripRepository = dicTripRepository;
    private readonly IMapper _mapper = mapper;

    public async Task<int> InsertTripUserThingsAsync(Guid tripId, Guid[] packageIds)
    {
        return await _dicTripRepository.InsertTripUserThingsAsync(tripId, packageIds);
    }

    public async Task<int> DeleteTripUserThingsAsync(Guid tripId, Guid[] packageIds)
    {
        return await _dicTripRepository.DeleteTripUserThingsAsync(tripId, packageIds);
    }

    public async Task<IEnumerable<TripThingDto>> GetAllAsync(Guid tripId)
    {
        var entities = await _tripUserThingRepository.GetAllAsync(tripId);
        return _mapper.Map<IEnumerable<TripThingDto>>(entities);
    }

    public async Task<TripThingDto?> GetByIdAsync(Guid id)
    {
        var entity = await _tripUserThingRepository.GetByIdAsync(id);
        return entity != null ? _mapper.Map<TripThingDto>(entity) : null;
    }

    public async Task<TripThingDto> AddAsync(CreateTripUserThingRequest request)
    {
        var entity = _mapper.Map<TripUserThing>(request);
        await _tripUserThingRepository.AddAsync(request.TripId, entity);
        return _mapper.Map<TripThingDto>(entity);
    }

    public async Task<bool> UpdateAsync(UpdateTripUserThingRequest request)
    {
        var entity = await _tripUserThingRepository.GetByIdAsync(request.Id);
        if (entity == null)
        {
            return false;
        }
        
        _mapper.Map(request, entity);
        await _tripUserThingRepository.UpdateAsync(entity);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _tripUserThingRepository.GetByIdAsync(id);
        if (entity == null)
        {
            return false;
        }
        
        await _tripUserThingRepository.DeleteAsync(id);
        return true;
    }

    public async Task<int> PackTripThingsAsync(Guid tripId, Guid packageId, Guid[] tripThingIds)
    {
        return await _dicTripRepository.PackTripThingsAsync(tripId, packageId, tripThingIds, false);
    }

    public async Task<int> UnpackTripThingsAsync(Guid tripId, Guid packageId, Guid[] tripThingIds)
    {
        return await _dicTripRepository.PackTripThingsAsync(tripId, packageId, tripThingIds, true);
    }
}
