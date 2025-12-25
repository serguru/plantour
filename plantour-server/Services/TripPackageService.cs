using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripPackageService(
    TripPackageRepository tripPackageRepository,
    TripUserRepository tripUserRepository,
    DicTripRepository dicTripRepository,
    ICheckAccessService checkAccessService,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser) : ITripPackageService
{
    private readonly TripPackageRepository _tripPackageRepository = tripPackageRepository;
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
       

    private readonly DicTripRepository _dicTripRepository = dicTripRepository;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;

    public async Task<int> InsertTripUserPackagesAsync(Guid tripId, Guid[] packageIds)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new UnauthorizedAccessException("User does not have access to this trip");
        }

        return await _dicTripRepository.InsertTripUserPackagesAsync(_currentUser.AdminId, _currentUser.UserId, tripId, packageIds);
    }

    public async Task<int> DeleteTripUserPackagesAsync(Guid tripId, Guid[] packageIds)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new UnauthorizedAccessException("User does not have access to this trip");
        }

        return await _dicTripRepository.DeleteTripUserPackagesAsync(_currentUser.AdminId, _currentUser.UserId, tripId, packageIds);
    }


    public async Task<IEnumerable<TripUserPackageDto>> GetAllAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new UnauthorizedAccessException("User does not have access to this trip");
        }

        var entities = await _tripPackageRepository.GetAllAsync(_currentUser.AdminId, _currentUser.UserId, tripId);
        return _mapper.Map<IEnumerable<TripUserPackageDto>>(entities);
    }

    public async Task<TripUserPackageDto?> GetByIdAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new UnauthorizedAccessException("User does not have access to this trip");
        }

        var entity = await _tripPackageRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        return entity != null ? _mapper.Map<TripUserPackageDto>(entity) : null;
    }

    public async Task<TripUserPackageDto> AddAsync(CreateTripPackageRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new UnauthorizedAccessException("User does not have access to this trip");
        }

        var tripUser = await _tripUserRepository.GetByTripIdAsync(
            _currentUser.AdminId,
            _currentUser.UserId,
            request.TripId);

        if (tripUser == null)
        {
            throw new UnauthorizedAccessException("Trip user not found");
        }

        var exists = await _tripPackageRepository.AnyAsync(x =>
            x.TripUserId == tripUser.Id &&
            x.Name.ToLower() == request.Name.ToLower());

        if (exists)
        {
            throw new InvalidOperationException("Package with the same name already exists");
        }

        var entity = _mapper.Map<TripUserPackage>(request);
        entity.Id = Guid.NewGuid();
        entity.TripUserId = tripUser.Id;
        await _tripPackageRepository.AddAsync(entity);
        return _mapper.Map<TripUserPackageDto>(entity);
    }

    public async Task UpdateAsync(UpdateTripPackageRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new UnauthorizedAccessException("User does not have access to this trip");
        }

        var tripUser = await _tripUserRepository.GetByTripIdAsync(
            _currentUser.AdminId,
            _currentUser.UserId,
            request.TripId);

        if (tripUser == null)
        {
            throw new UnauthorizedAccessException("Trip user not found");
        }

        var exists = await _tripPackageRepository.AnyAsync(x =>
            x.TripUserId == tripUser.Id &&
            x.Name.ToLower() == request.Name.ToLower() &&
            x.Id != request.Id);

        if (exists)
        {
            throw new InvalidOperationException("Package with the same name already exists");
        }

        var entity = await _tripPackageRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, request.TripId, request.Id);
        if (entity == null)
        {
            throw new UnauthorizedAccessException("User does not have access to this trip");
        }

        _mapper.Map(request, entity);
        await _tripPackageRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new UnauthorizedAccessException("User does not have access to this trip");
        }

        var exists = await _tripPackageRepository.AnyByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        if (!exists)
        {
            throw new InvalidOperationException("Trip package not found or access denied");
        }

        await _tripPackageRepository.DeleteAsync(id);
    }
}
