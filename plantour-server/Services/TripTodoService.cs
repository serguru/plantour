using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripTodoService(
    TripTodoRepository tripTodoRepository,
    DicTripRepository dicTripRepository,
    ICheckAccessService checkAccessService,
    TripUserRepository tripUserRepository,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser,
    UsersRepository usersRepository,
    ISharedAssignmentNotificationService sharedAssignmentNotificationService) : ITripTodoService
{
    private readonly TripTodoRepository _tripUserTodoRepository = tripTodoRepository;
    private readonly DicTripRepository _dicTripRepository = dicTripRepository;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
    private readonly UsersRepository _usersRepository = usersRepository;
    private readonly ISharedAssignmentNotificationService _sharedAssignmentNotificationService = sharedAssignmentNotificationService;

    public async Task<int> InsertTripUserTodosAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAuthenticated();
        return await _dicTripRepository.InsertTripUserTodosAsync(_currentUser.AdminId, _currentUser.UserId, tripId, ids);
    }

    public async Task<int> DeleteTripUserTodosAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAuthenticated();
        return await _dicTripRepository.DeleteTripUserTodosAsync(_currentUser.AdminId, _currentUser.UserId, tripId, ids);
    }

    public async Task<IEnumerable<TripTodoDto>> GetAllAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entities = await _tripUserTodoRepository.GetAllAsync(_currentUser.AdminId, _currentUser.UserId, tripId);
        return _mapper.Map<IEnumerable<TripTodoDto>>(entities);
    }

    public async Task<TripTodoDto?> GetByIdAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entity = await _tripUserTodoRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        return entity != null ? _mapper.Map<TripTodoDto>(entity) : null;
    }

    public async Task<TripTodoDto> AddAsync(CreateTripTodoRequest request)
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

        var exists = await _tripUserTodoRepository.AnyAsync(x =>
            x.TripUserId == tripUser.Id &&
            x.Name.ToLower() == request.Name.ToLower());

        if (exists)
        {
            throw new CustomException("Todo with the same name already exists");
        }

        var entity = _mapper.Map<TripUserTodo>(request);
        entity.Id = Guid.NewGuid();
        entity.TripUserId = tripUser.Id;
        await _tripUserTodoRepository.AddAsync(entity);
        return _mapper.Map<TripTodoDto>(entity);
    }

    public async Task UpdateAsync(UpdateTripTodoRequest request)
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

        var exists = await _tripUserTodoRepository.AnyAsync(x =>
            x.TripUserId == tripUser.Id &&
            x.Name.ToLower() == request.Name.ToLower() &&
            x.Id != request.Id);

        if (exists)
        {
            throw new CustomException("Todo with the same name already exists");
        }

        var entity = await _tripUserTodoRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, request.TripId, request.Id);
        if (entity == null)
        {
            throw new CustomException("User does not have access to this trip");
        }

        _mapper.Map(request, entity);
        await _tripUserTodoRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var exists = await _tripUserTodoRepository.AnyByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        if (!exists)
        {
            throw new CustomException("Trip todo not found or access denied");
        }

        await _tripUserTodoRepository.DeleteAsync(id);
    }

    public async Task ToggleFinishedTripTodosAsync(Guid tripId, Guid id, string? finished)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = await _tripUserTodoRepository.GetByIdWithSharedDetailsAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        if (entity == null)
        {
            throw new CustomException("Trip todo not found or access denied");
        }
        entity.Finished = finished;
        await _tripUserTodoRepository.UpdateAsync(entity);

        if (finished == "success" || finished == "failure")
        {
            var sharedTodo = entity.TripSharedTodos.FirstOrDefault();
            if (sharedTodo != null)
            {
                var admin = await _usersRepository.GetActiveByIdAsync(_currentUser.AdminId);
                var participant = await _usersRepository.GetActiveByIdAsync(_currentUser.UserId);

                if (admin != null && participant != null)
                {
                    await _sharedAssignmentNotificationService.NotifyAdminParticipantActionAsync(
                        admin,
                        participant,
                        entity.TripUser.Trip.Name,
                        tripId,
                        "shared todo",
                        entity.Name,
                        "trip-shared-todos",
                        finished == "success" ? "finished successfully" : "finished with failure");
                }
            }
        }
    }
}