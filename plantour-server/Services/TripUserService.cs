using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripUserService(
    TripUserRepository tripUserRepository,
    ICheckAccessService checkAccessService,
    DicTripRepository dicTripRepository,
    AdminsParticipantRepository adminsParticipantRepository,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser) : ITripUserService
{
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
    private readonly IMapper _mapper = mapper;
    private readonly DicTripRepository _dicTripRepository = dicTripRepository;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly AdminsParticipantRepository _adminsParticipantRepository = adminsParticipantRepository;

    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;

    public async Task<int> InsertTripUsersAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }


        return await _dicTripRepository.InsertTripUsersAsync(_currentUser.AdminId, tripId, ids);
    }

    public async Task<int> DeleteTripUsersAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        return await _dicTripRepository.DeleteTripUsersAsync(_currentUser.AdminId, tripId, ids);
    }

    public async Task<IEnumerable<TripUserDto>> GetAllAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entities = await _tripUserRepository.GetAllAsync(_currentUser.AdminId, tripId);
        return _mapper.Map<IEnumerable<TripUserDto>>(entities);
    }

    public async Task<TripUserDto?> GetByIdAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }
        var entity = await _tripUserRepository.GetByIdAsync(_currentUser.AdminId, tripId, id);
        return entity != null ? _mapper.Map<TripUserDto>(entity) : null;
    }

    public async Task<TripUserDto> AddAsync(CreateTripUserRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        if (!await _adminsParticipantRepository.AnyAsync(x =>
                x.AdminId == _currentUser.AdminId &&
                x.Id == request.AdminParticipantId))
        {
            throw new CustomException("AdminParticipant not found or access denied");
        }

        if (await _tripUserRepository.AnyAsync(x =>
                x.TripId == request.TripId &&
                x.AdminParticipantId == request.AdminParticipantId))
        {
            throw new CustomException("Trip User already exists for this trip");
        }

        var entity = _mapper.Map<TripUser>(request);
        entity.Id = Guid.NewGuid();
        await _tripUserRepository.AddAsync(entity);
        return _mapper.Map<TripUserDto>(entity);
    }

    public async Task UpdateAsync(UpdateTripUserRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        if (!await _adminsParticipantRepository.AnyAsync(x =>
                x.AdminId == _currentUser.AdminId &&
                x.Id == request.AdminParticipantId))
        {
            throw new CustomException("AdminParticipant not found or access denied");
        }


        var entity = await _tripUserRepository.GetByIdAsync(_currentUser.AdminId, request.TripId, request.Id);
        if (entity == null)
        {
            throw new CustomException("Trip User does not exist for this trip");
        }
       
        _mapper.Map(request, entity);
        await _tripUserRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }
        
        await _tripUserRepository.DeleteAsync(id);
    }
}
