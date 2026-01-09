using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripThingService(
    TripThingRepository TripThingRepository,
    DicTripRepository dicTripRepository,
    ICheckAccessService checkAccessService,
    TripUserRepository tripUserRepository,
    ThingRepository ThingRepository,
    TemplateRepository templateRepository,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser) : ITripThingService
{
    private readonly TripThingRepository _tripUserThingRepository = TripThingRepository;
    private readonly DicTripRepository _dicTripRepository = dicTripRepository;
    private readonly TemplateRepository _templateRepository = templateRepository;
    private readonly ThingRepository _userThingRepository = ThingRepository;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;

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
    public async Task<int> InsertTemplateTripSharedThingsAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
        return await _dicTripRepository.InsertTemplateTripSharedThingsAsync(_currentUser.AdminId, tripId, ids);
    }

    public async Task<int> DeleteTemplateTripSharedThingsAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
        return await _dicTripRepository.DeleteTemplateTripSharedThingsAsync(_currentUser.AdminId, tripId, ids);
    }
    public async Task<int> InsertTemplateTripUserThingsAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
        return await _dicTripRepository.InsertTemplateTripUserThingsAsync(_currentUser.AdminId, _currentUser.UserId, tripId, ids);
    }

    public async Task<int> DeleteTemplateTripUserThingsAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
        return await _dicTripRepository.DeleteTemplateTripUserThingsAsync(_currentUser.AdminId, _currentUser.UserId, tripId, ids);
    }

    public async Task<IEnumerable<TripThingDto>> GetAllAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entities = await _tripUserThingRepository.GetAllAsync(_currentUser.AdminId, _currentUser.UserId, tripId);
        return _mapper.Map<IEnumerable<TripThingDto>>(entities);
    }


    public async Task<TripThingDto?> GetByIdAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entity = await _tripUserThingRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        return entity != null ? _mapper.Map<TripThingDto>(entity) : null;
    }

    public async Task<TripThingDto> AddAsync(CreateTripThingRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripUser = await _tripUserRepository.GetByTripIdAsync(
            _currentUser.AdminId,
            _currentUser.UserId,
            request.TripId);

        if (tripUser == null)
        {
            throw new CustomException("Trip user not found");
        }

        var exists = await _tripUserThingRepository.AnyAsync(x =>
            x.TripUserId == tripUser.Id &&
            x.Name.ToLower() == request.Name.ToLower());

        if (exists)
        {
            throw new CustomException("Thing with the same name already exists");
        }

        var entity = _mapper.Map<TripUserThing>(request);
        entity.Id = Guid.NewGuid();
        entity.TripUserId = tripUser.Id;
        await _tripUserThingRepository.AddAsync(entity);
        return _mapper.Map<TripThingDto>(entity);
    }

    public async Task UpdateAsync(UpdateTripThingRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripUser = await _tripUserRepository.GetByTripIdAsync(
            _currentUser.AdminId,
            _currentUser.UserId,
            request.TripId);

        if (tripUser == null)
        {
            throw new CustomException("Trip user not found");
        }

        var exists = await _tripUserThingRepository.AnyAsync(x =>
            x.TripUserId == tripUser.Id &&
            x.Name.ToLower() == request.Name.ToLower() &&
            x.Id != request.Id);

        if (exists)
        {
            throw new CustomException("Thing with the same name already exists");
        }

        var entity = await _tripUserThingRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, request.TripId, request.Id);
        if (entity == null)
        {
            throw new CustomException("User does not have access to this trip");
        }
        
        _mapper.Map(request, entity);
        await _tripUserThingRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var exists = await _tripUserThingRepository.AnyByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        if (!exists)
        {
            throw new CustomException("Trip thing not found or access denied");
        }
        
        await _tripUserThingRepository.DeleteAsync(id);
    }

    public async Task<int> PackTripThingsAsync(Guid tripId, Guid packageId, Guid[] tripThingIds)
    {
        _currentUser.RaiseIfNotAuthenticated();
        return await _dicTripRepository.PackTripThingsAsync(_currentUser.AdminId, _currentUser.UserId, tripId, packageId, tripThingIds, false);
    }

    public async Task<int> UnpackTripThingsAsync(Guid tripId, Guid[] tripThingIds)
    {
        _currentUser.RaiseIfNotAuthenticated();
        return await _dicTripRepository.PackTripThingsAsync(_currentUser.AdminId, _currentUser.UserId, tripId, Guid.Empty, tripThingIds, true);
    }
}
