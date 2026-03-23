using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using plantour_server.Utils;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripSharedTodoService(
    TripSharedTodoRepository tripSharedTodoRepository,
    ICheckAccessService checkAccessService,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser,
    DicTripRepository dicTripRepository,
    TripUserRepository tripUserRepository,
    TripTodoRepository tripTodoRepository,
    UsersRepository usersRepository,
    ISharedAssignmentNotificationService sharedAssignmentNotificationService
    ) : ITripSharedTodoService
{
    private readonly TripSharedTodoRepository _tripSharedTodoRepository = tripSharedTodoRepository;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly DicTripRepository _dicTripRepository = dicTripRepository;
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
    private readonly TripTodoRepository _tripTodoRepository = tripTodoRepository;
    private readonly UsersRepository _usersRepository = usersRepository;
    private readonly ISharedAssignmentNotificationService _sharedAssignmentNotificationService = sharedAssignmentNotificationService;

    public async Task<IEnumerable<TripSharedTodoDto>> GetAllFullAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var items = (await _tripSharedTodoRepository.GetAllFullAsync(tripId)).OrderBy(x => x.Id).ToList();
        return _mapper.Map<IEnumerable<TripSharedTodoDto>>(items);
    }

    public async Task<IEnumerable<TripSharedTodoDto>> GetAllForAssigneeAsync(Guid tripId, Guid assigneeId)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var items = (await _tripSharedTodoRepository.GetAllFullForAssigneeAsync(tripId, assigneeId)).OrderBy(x => x.Id).ToList();
        return _mapper.Map<IEnumerable<TripSharedTodoDto>>(items);
    }

    public async Task<TripSharedTodoDto?> GetByIdAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var item = await _tripSharedTodoRepository.GetByIdFullAsync(tripId, id);
        return _mapper.Map<TripSharedTodoDto?>(item);
    }

    public async Task<TripSharedTodoDto> AddAsync(CreateTripSharedTodoRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var exists = await _tripSharedTodoRepository.AnyAsync(x =>
            x.TripId == request.TripId &&
            x.Name.ToLower() == request.Name.ToLower());

        if (exists)
        {
            throw new CustomException("Shared todo with the same name already exists");
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

        var entity = _mapper.Map<TripSharedTodo>(request);
        entity.Id = Guid.NewGuid();
        entity.AssignedAt = request.AssignedToId != null ? DateTime.UtcNow : null;
        entity.Rejected = false;
        entity.AssignedTodoId = null;
        await _tripSharedTodoRepository.AddAsync(entity);
        return _mapper.Map<TripSharedTodoDto>(entity);
    }

    public async Task UpdateAsync(UpdateTripSharedTodoRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var exists = await _tripSharedTodoRepository.AnyAsync(x =>
            x.TripId == request.TripId &&
            x.Name.ToLower() == request.Name.ToLower() &&
            x.Id != request.Id);

        if (exists)
        {
            throw new CustomException("Shared todo with the same name already exists");
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

        var entity = (await _tripSharedTodoRepository.FindAsync(x =>
            x.Id == request.Id &&
            x.TripId == request.TripId)).FirstOrDefault();

        if (entity == null)
        {
            throw new CustomException("Trip shared todo not found");
        }

        if (request.AssignedToId != entity.AssignedToId)
        {
            entity.AssignedAt = null;
            entity.Rejected = false;
            entity.AssignedTodoId = null;
        }

        _mapper.Map(request, entity);
        await _tripSharedTodoRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        await _tripSharedTodoRepository.DeleteAsync(tripId, id);
    }

    public async Task<int> InsertTripSharedTodosAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
        return await _dicTripRepository.InsertTripSharedTodosAsync(_currentUser.AdminId, tripId, ids);
    }

    public async Task<int> DeleteTripSharedTodosAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        return await _dicTripRepository.DeleteTripSharedTodosAsync(_currentUser.AdminId, tripId, ids);
    }

    public async Task ToggleAcceptAssignmentAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = await _tripSharedTodoRepository.GetByIdFullAsync(tripId, id) ?? throw new CustomException("Trip shared todo not found");

        if (entity.AssignedToId == null)
        {
            throw new CustomException("User does not have this shared todo assignee or no access");
        }

        var assignedToTripUser = await _tripUserRepository.GetByIdAsync(
            _currentUser.AdminId,
            _currentUser.UserId,
            entity.TripId,
            entity.AssignedToId.Value);

        if (assignedToTripUser == null)
        {
            throw new CustomException("AssignedTo trip user not found");
        }

        var shouldNotifyAccepted = entity.AssignedTodoId == null;

        if (shouldNotifyAccepted)
        {
            var todo = await _tripTodoRepository.FindAsync(x => x.TripUserId == assignedToTripUser.Id && x.Name.ToLower() == entity.Name.ToLower()).ContinueWith(t => t.Result.FirstOrDefault());
            if (todo == null)
            {
                todo = new TripUserTodo()
                {
                    Id = Guid.NewGuid(),
                    TripUserId = assignedToTripUser.Id,
                    Category = entity.Category,
                    Name = entity.Name,
                    Notes = entity.Notes
                };
                todo = await _tripTodoRepository.AddAsync(todo);
            }
            entity.AssignedTodoId = todo.Id;
            entity.Rejected = false;
        }
        else
        {
            var assignedTodoId = entity.AssignedTodoId ?? throw new CustomException("Assigned todo not found");
            var todo = await _tripTodoRepository.GetByIdAsync(
                _currentUser.AdminId,
                _currentUser.UserId,
                entity.TripId,
                assignedTodoId);

            if (todo != null)
            {
                await _tripTodoRepository.DeleteAsync(todo.Id);
            }

            entity.AssignedTodoId = null;
        }

        await _tripSharedTodoRepository.UpdateAsync(entity);

        if (shouldNotifyAccepted)
        {
            await NotifyAdminAboutParticipantActionAsync(entity, "shared todo", "trip-shared-todos", "accepted");
        }
    }

    public async Task ToggleRejectAssignmentAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = await _tripSharedTodoRepository.GetByIdFullAsync(tripId, id) ?? throw new CustomException("Trip shared todo not found");

        if (entity.AssignedToId == null)
        {
            throw new CustomException("User does not have this shared todo assignee or no access");
        }

        var assignedToTripUser = await _tripUserRepository.GetByIdAsync(
            _currentUser.AdminId,
            _currentUser.UserId,
            entity.TripId,
            entity.AssignedToId.Value);

        if (assignedToTripUser == null)
        {
            throw new CustomException("AssignedTo trip user not found");
        }

        var shouldNotifyRejected = !entity.Rejected;

        if (entity.Rejected)
        {
            entity.Rejected = false;
        }
        else
        {
            entity.Rejected = true;

            if (entity.AssignedTodoId != null)
            {
                var todo = await _tripTodoRepository.GetByIdAsync(
                    _currentUser.AdminId,
                    _currentUser.UserId,
                    entity.TripId,
                    entity.AssignedTodoId.Value);

                if (todo != null)
                {
                    await _tripTodoRepository.DeleteAsync(todo.Id);
                }

                entity.AssignedTodoId = null;
            }
        }

        await _tripSharedTodoRepository.UpdateAsync(entity);

        if (shouldNotifyRejected)
        {
            await NotifyAdminAboutParticipantActionAsync(entity, "shared todo", "trip-shared-todos", "refused");
        }
    }

    public async Task<int> AssignTripSharedTodosAsync(MultipleIdsAssignRequest request)
    {
        _currentUser.RaiseIfNotAdmin();
        var before = await _tripSharedTodoRepository.GetByIdsFullAsync(request.CollectionId, request.Ids);
        var result = await _dicTripRepository.AssignTripSharedTodosAsync(_currentUser.AdminId, request.CollectionId, request.Id, request.Ids, request.DeadlineAt, false);
        var after = await _tripSharedTodoRepository.GetByIdsFullAsync(request.CollectionId, request.Ids);
        await NotifyParticipantAssignmentChangesAsync(before, after, "shared todos", "trip-shared-todos");
        return result;
    }

    public async Task<int> UnassignTripSharedTodosAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
        var before = await _tripSharedTodoRepository.GetByIdsFullAsync(tripId, ids);
        var result = await _dicTripRepository.AssignTripSharedTodosAsync(_currentUser.AdminId, tripId, Guid.Empty, ids, null, true);
        var after = await _tripSharedTodoRepository.GetByIdsFullAsync(tripId, ids);
        await NotifyParticipantAssignmentChangesAsync(before, after, "shared todos", "trip-shared-todos");
        return result;
    }

    private async Task NotifyParticipantAssignmentChangesAsync(
        List<TripSharedTodo> before,
        List<TripSharedTodo> after,
        string entityLabel,
        string entityRoute)
    {
        var admin = await _usersRepository.GetActiveByIdAsync(_currentUser.AdminId);
        if (admin == null)
        {
            return;
        }

        var tripName = after.FirstOrDefault()?.Trip?.Name ?? before.FirstOrDefault()?.Trip?.Name;
        var tripId = after.FirstOrDefault()?.TripId ?? before.FirstOrDefault()?.TripId;

        if (string.IsNullOrWhiteSpace(tripName) || tripId == null)
        {
            return;
        }

        var grouped = new Dictionary<(string Email, string Name, string Action, DateTime? DeadlineAt), List<string>>();

        foreach (var afterEntity in after)
        {
            var beforeEntity = before.FirstOrDefault(x => x.Id == afterEntity.Id);

            if (beforeEntity?.AssignedToId != afterEntity.AssignedToId)
            {
                if (beforeEntity?.AssignedTo?.AdminParticipant?.Participant != null)
                {
                    AddParticipantAssignmentChange(
                        grouped,
                        beforeEntity.AssignedTo.AdminParticipant.Participant,
                        "Unassigned",
                        null,
                        beforeEntity.Name);
                }

                if (afterEntity.AssignedTo?.AdminParticipant?.Participant != null)
                {
                    AddParticipantAssignmentChange(
                        grouped,
                        afterEntity.AssignedTo.AdminParticipant.Participant,
                        "Assigned",
                        afterEntity.AssignedDeadline,
                        afterEntity.Name);
                }
            }
        }

        var changes = grouped.Select(x => new ParticipantAssignmentEmailChange(
            x.Key.Email,
            x.Key.Name,
            x.Key.Action,
            x.Value,
            x.Key.DeadlineAt)).ToList();

        await _sharedAssignmentNotificationService.NotifyParticipantAssignmentChangesAsync(
            admin,
            tripName,
            tripId.Value,
            entityLabel,
            entityRoute,
            changes);
    }

    private static void AddParticipantAssignmentChange(
        Dictionary<(string Email, string Name, string Action, DateTime? DeadlineAt), List<string>> grouped,
        User participant,
        string actionLabel,
        DateTime? deadlineAt,
        string entityName)
    {
        if (participant.Temporary)
        {
            return;
        }

        var name = Misc.GenerateFullName(participant.FirstName, participant.LastName);
        name = string.IsNullOrWhiteSpace(name) ? participant.Email : name;
        var key = (participant.Email, name, actionLabel, deadlineAt);

        if (!grouped.TryGetValue(key, out var names))
        {
            names = [];
            grouped[key] = names;
        }

        names.Add(entityName);
    }

    private async Task NotifyAdminAboutParticipantActionAsync(
        TripSharedTodo entity,
        string entityLabel,
        string entityRoute,
        string actionLabel)
    {
        var admin = await _usersRepository.GetActiveByIdAsync(_currentUser.AdminId);
        var participant = await _usersRepository.GetActiveByIdAsync(_currentUser.UserId);

        if (admin == null || participant == null)
        {
            return;
        }

        await _sharedAssignmentNotificationService.NotifyAdminParticipantActionAsync(
            admin,
            participant,
            entity.Trip.Name,
            entity.TripId,
            entityLabel,
            entity.Name,
            entityRoute,
            actionLabel);
    }
}