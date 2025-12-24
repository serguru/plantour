using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripUserService(
    TripUserRepository tripUserRepository,
    DicTripRepository dicTripRepository,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser) : ITripUserService
{
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
    private readonly IMapper _mapper = mapper;
    private readonly DicTripRepository _dicTripRepository = dicTripRepository;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    public async Task<int> InsertTripUsersAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
        return await _dicTripRepository.InsertTripUsersAsync(_currentUser.AdminId, tripId, ids);
    }

    public async Task<int> DeleteTripUsersAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
        return await _dicTripRepository.DeleteTripUsersAsync(_currentUser.AdminId, tripId, ids);
    }

    public async Task<IEnumerable<TripUserDto>> GetAllAsync(Guid tripId)
    {
        var entities = await _tripUserRepository.GetAllAsync(tripId);
        return _mapper.Map<IEnumerable<TripUserDto>>(entities);
    }

    public async Task<TripUserDto?> GetByIdAsync(Guid tripId, Guid id)
    {
        var entity = await _tripUserRepository.GetByIdAsync(tripId, id);
        return entity != null ? _mapper.Map<TripUserDto>(entity) : null;
    }

    public async Task<TripUserDto> AddAsync(CreateTripUserRequest request)
    {
        var entity = _mapper.Map<TripUser>(request);
        await _tripUserRepository.AddAsync(entity);
        return _mapper.Map<TripUserDto>(entity);
    }

    public async Task<bool> UpdateAsync(UpdateTripUserRequest request)
    {
        var entity = await _tripUserRepository.GetByIdAsync(request.TripId, request.Id);
        if (entity == null)
        {
            return false;
        }
        
        _mapper.Map(request, entity);
        await _tripUserRepository.UpdateAsync(entity);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid tripId, Guid id)
    {
        var entity = await _tripUserRepository.GetByIdAsync(tripId, id);
        if (entity == null)
        {
            return false;
        }
        
        await _tripUserRepository.DeleteAsync(tripId, id);
        return true;
    }
}
