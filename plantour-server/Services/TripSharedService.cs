using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripSharedService(
    TripSharedRepository tripSharedRepository,
    ICheckAccessService checkAccessService,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser,
    DicTripRepository dicTripRepository,
    TripUserRepository tripUserRepository

    ) : ITripSharedService
{
    private readonly TripSharedRepository _tripSharedRepository = tripSharedRepository;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly DicTripRepository _dicTripRepository = dicTripRepository;
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;

    public async Task<IEnumerable<TripSharedDto>> GetAllFullAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }


        var items = await _tripSharedRepository.GetAllFullAsync(tripId);
        return _mapper.Map<IEnumerable<TripSharedDto>>(items);
    }


    public async Task<TripSharedDto?> GetByIdAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var item = await _tripSharedRepository.GetByIdFullAsync(tripId, id);
        return _mapper.Map<TripSharedDto?>(item);
    }

    public async Task<TripSharedDto> AddAsync(CreateTripSharedRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var exists = await _tripSharedRepository.AnyAsync(x =>
            x.TripId == request.TripId &&
            x.Name.ToLower() == request.Name.ToLower());

        if (exists)
        {
            throw new CustomException("Shared thing with the same name already exists");
        }

        if (request.AssignedToId != null)
        {
            bool assignedToExists = await _tripUserRepository.AnyByIdAsync(
                _currentUser.AdminId,
                request.TripId,
                request.AssignedToId.Value);

            if (!assignedToExists)
            {
                throw new CustomException("AssignedTo trip user not found or does not belong to the same trip");
            }
        }

        var entity = _mapper.Map<TripSharedThing>(request);
        entity.Id = Guid.NewGuid();
        entity.AssignedAt = request.AssignedToId != null ? DateTime.UtcNow : null;
        entity.Rejected = false;
        entity.AssignedThingId = null;
        await _tripSharedRepository.AddAsync(entity);
        return _mapper.Map<TripSharedDto>(entity);
    }

    public async Task UpdateAsync(UpdateTripSharedRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var exists = await _tripSharedRepository.AnyAsync(x =>
            x.TripId == request.TripId &&
            x.Name.ToLower() == request.Name.ToLower() &&
            x.Id != request.Id);

        if (exists)
        {
            throw new CustomException("Shared thing with the same name already exists");
        }

        if (request.AssignedToId != null)
        {
            bool assignedToExists = await _tripUserRepository.AnyByIdAsync(
                _currentUser.AdminId,
                request.TripId,
                request.AssignedToId.Value);

            if (!assignedToExists)
            {
                throw new CustomException("AssignedTo trip user not found or does not belong to the same trip");
            }
        }

        var entities = await _tripSharedRepository.FindAsync(x =>
            x.Id == request.Id &&
            x.TripId == request.TripId
        );

        var entity = entities.FirstOrDefault();

        if (entity == null)
        {
            throw new CustomException("Trip shared thing not found");
        }
        ;

        if (request.AssignedToId != entity.AssignedToId)
        {
            entity.AssignedAt = null;
            entity.Rejected = false;
            entity.AssignedThingId = null;
        }
        _mapper.Map(request, entity);
        await _tripSharedRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        await _tripSharedRepository.DeleteAsync(tripId, id);
    }

    public async Task<int> InsertTripSharedsAsync(Guid tripId, Guid[] thingIds)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        return await _dicTripRepository.InsertTripSharedThingsAsync(_currentUser.AdminId, tripId, thingIds);
    }

    public async Task<int> DeleteTripSharedsAsync(Guid tripId, Guid[] thingIds)
    {

        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        return await _dicTripRepository.DeleteTripSharedThingsAsync(_currentUser.AdminId, tripId, thingIds);
    }

    public async Task AcceptAssignmentAsync(Guid tripId, Guid id)
    {
    }

    public async Task RejectAssignmentAsync(Guid tripId, Guid id)
    {
        throw new NotImplementedException();
    }
}