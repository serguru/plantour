using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripThingService(
    TripThingRepository TripThingRepository,
    DicTripRepository dicTripRepository,
    ThingRepository ThingRepository,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser) : ITripThingService
{
    private readonly TripThingRepository _tripUserThingRepository = TripThingRepository;
    private readonly DicTripRepository _dicTripRepository = dicTripRepository;
    private readonly ThingRepository _userThingRepository = ThingRepository;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;

    public async Task<int> InsertTripUserThingsAsync(Guid tripId, Guid[] packageIds)
    {
        _currentUser.RaiseIfNotAuthenticated();
        return await _dicTripRepository.InsertTripUserThingsAsync(_currentUser.AdminId, _currentUser.UserId, tripId, packageIds);
    }

    public async Task<int> DeleteTripUserThingsAsync(Guid tripId, Guid[] packageIds)
    {
        _currentUser.RaiseIfNotAuthenticated();
        return await _dicTripRepository.DeleteTripUserThingsAsync(_currentUser.AdminId, _currentUser.UserId, tripId, packageIds);
    }

    public async Task<IEnumerable<TripThingDto>> GetAllAsync(Guid tripId)
    {
        var entities = await _tripUserThingRepository.GetAllAsync(tripId);
        return _mapper.Map<IEnumerable<TripThingDto>>(entities);
    }


    public async Task<TripThingDto?> GetByIdAsync(Guid tripId, Guid id)
    {
        var entity = await _tripUserThingRepository.GetByIdAsync(tripId, id);
        return entity != null ? _mapper.Map<TripThingDto>(entity) : null;
    }

    public async Task<TripThingDto> AddAsync(CreateTripThingRequest request)
    {
        var entity = _mapper.Map<TripUserThing>(request);
        await _tripUserThingRepository.AddAsync(request.TripId, entity);
        return _mapper.Map<TripThingDto>(entity);
    }

    public async Task<bool> UpdateAsync(UpdateTripThingRequest request)
    {
        var entity = await _tripUserThingRepository.GetByIdAsync(request.TripId, request.Id);
        if (entity == null)
        {
            return false;
        }
        
        _mapper.Map(request, entity);
        await _tripUserThingRepository.UpdateAsync(request.TripId, entity);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid tripId, Guid id)
    {
        var entity = await _tripUserThingRepository.GetByIdAsync(tripId, id);
        if (entity == null)
        {
            return false;
        }
        
        await _tripUserThingRepository.DeleteAsync(tripId, id);
        return true;
    }

    public async Task<int> PackTripThingsAsync(Guid tripId, Guid packageId, Guid[] tripThingIds)
    {
        _currentUser.RaiseIfNotAuthenticated();
        return await _dicTripRepository.PackTripThingsAsync(_currentUser.AdminId, _currentUser.UserId, tripId, packageId, tripThingIds, false);
    }

    public async Task<int> UnpackTripThingsAsync(Guid tripId, Guid packageId, Guid[] tripThingIds)
    {
        _currentUser.RaiseIfNotAuthenticated();
        return await _dicTripRepository.PackTripThingsAsync(_currentUser.AdminId, _currentUser.UserId, tripId, packageId, tripThingIds, true);
    }

}
