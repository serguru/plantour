using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using plantour_server.Utils;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripSharedService(
    TripSharedRepository tripSharedRepository,
    ICheckAccessService checkAccessService,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser,
    DicTripRepository dicTripRepository,
    TripUserRepository tripUserRepository,
    TripThingRepository tripThingRepository,
    UsersRepository usersRepository,
    ISharedAssignmentNotificationService sharedAssignmentNotificationService
    ) : ITripSharedService
{
    private readonly TripSharedRepository _tripSharedRepository = tripSharedRepository;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly DicTripRepository _dicTripRepository = dicTripRepository;
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
    private readonly TripThingRepository _tripThingRepository = tripThingRepository;
    private readonly UsersRepository _usersRepository = usersRepository;
    private readonly ISharedAssignmentNotificationService _sharedAssignmentNotificationService = sharedAssignmentNotificationService;

    public async Task<IEnumerable<TripSharedDto>> GetAllFullAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        // order by id to have consistent order for "none" client sorting
        var items = (await _tripSharedRepository.GetAllFullAsync(tripId)).OrderBy(x => x.Id).ToList();
        return _mapper.Map<IEnumerable<TripSharedDto>>(items);
    }


    public async Task<IEnumerable<TripSharedDto>> GetAllForAssigneeAsync(Guid tripId, Guid assigneeId)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }


        var items = (await _tripSharedRepository.GetAllFullForAssigneeAsync(tripId, assigneeId)).OrderBy(x => x.Id).ToList();
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
            throw new CustomException("Shared item with the same name already exists");
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

        await CheckAccessAsync(request.TripId, 1);

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
            throw new CustomException("Shared item with the same name already exists");
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
            throw new CustomException("Trip shared item not found");
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

    public async Task<int> InsertTripSharedsAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
        await CheckAccessAsync(tripId, ids.Length);
        return await _dicTripRepository.InsertTripSharedThingsAsync(_currentUser.AdminId, tripId, ids);
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

    public async Task ToggleAcceptAssignmentAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = await _tripSharedRepository.GetByIdFullAsync(tripId, id) ?? throw new CustomException("Trip shared item not found");

        if (entity == null || entity.AssignedToId == null)
        {
            throw new CustomException("User does not have this shared item assignee or no access");
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

        var shouldNotifyAccepted = entity.AssignedThingId == null;

        if (shouldNotifyAccepted) // accept
        {
            var thing = await _tripThingRepository.FindAsync(x => x.TripUserId == assignedToTripUser.Id && x.Name.ToLower() == entity.Name.ToLower()).ContinueWith(t => t.Result.FirstOrDefault());
            if (thing == null)
            {
                thing = new TripUserThing()
                {
                    Id = Guid.NewGuid(),
                    TripUserId = assignedToTripUser.Id,
                    Category = entity.Category,
                    Name = entity.Name,
                    Units = entity.Units,
                    Value = entity.Value
                };
                thing = await _tripThingRepository.AddAsync(thing);
            }
            entity.AssignedThingId = thing.Id;
            entity.Rejected = false;
        }
        else // deaccept
        {
            var assignedThingId = entity.AssignedThingId ?? throw new CustomException("Assigned thing not found");
            var thing = await _tripThingRepository.GetByIdAsync(
                _currentUser.AdminId,
                _currentUser.UserId,
                entity.TripId,
                assignedThingId);

            if (thing != null)
            {
                await _tripThingRepository.DeleteAsync(thing.Id);
            }

            entity.AssignedThingId = null;
        }
        await _tripSharedRepository.UpdateAsync(entity);

        if (shouldNotifyAccepted)
        {
            await NotifyAdminAboutParticipantActionAsync(entity, "shared item", "trip-shared", "accepted");
        }
    }

    public async Task ToggleRejectAssignmentAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = await _tripSharedRepository.GetByIdFullAsync(tripId, id) ?? throw new CustomException("Trip shared item not found");

        if (entity == null || entity.AssignedToId == null)
        {
            throw new CustomException("User does not have this shared thing assignee or no access");
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

        if (entity.Rejected) // unreject
        {
            entity.Rejected = false;
        }
        else // reject
        {
            entity.Rejected = true;

            if (entity.AssignedThingId != null)
            {
                var thing1 = await _tripThingRepository.GetByIdAsync(
                    _currentUser.AdminId,
                    _currentUser.UserId,
                    entity.TripId,
                    entity.AssignedThingId.Value);

                if (thing1 != null)
                {
                    await _tripThingRepository.DeleteAsync(thing1.Id);
                }

                entity.AssignedThingId = null;
            }

        }

        await _tripSharedRepository.UpdateAsync(entity);

        if (shouldNotifyRejected)
        {
            await NotifyAdminAboutParticipantActionAsync(entity, "shared item", "trip-shared", "refused");
        }
    }


    public async Task<int> InsertTemplateTripSharedThingsAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
        await CheckAccessAsync(tripId, ids.Length);
        return await _dicTripRepository.InsertTemplateTripSharedThingsAsync(_currentUser.AdminId, tripId, ids);
    }

    private async Task CheckAccessAsync(Guid tripId, int addQty)
    {
        var rule = _currentUser.AccessRules!.FirstOrDefault(x => x.Id == 40);
        var granted = rule!.Granted;

        if (granted)
        {
            return;
        }

        int limit = rule.Value!.Value;

        var s1 = $"You've reached the limit of {limit} shared items you can add to your trip.";

        var s2 = _currentUser.IsAdmin ? "Please go to your profile page and upgrade your plan to remove this limit." : "Please ask your administrator to upgrade the plan to remove this limit.";


        var currentCount = await _tripSharedRepository.CountAsync(tripId);
        if (currentCount + addQty > limit)
        {
            throw new CustomException($"{s1} {s2}", "PLAN_LIMIT_REACHED");
        }
    }

    public async Task<int> InsertTemplateAiTripSharedThingsAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
        await CheckAccessAsync(tripId, ids.Length);
        return await _dicTripRepository.InsertTemplateAiTripSharedThingsAsync(_currentUser.AdminId, tripId, ids);
    }

    public async Task<int> DeleteTemplateTripSharedThingsAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
        return await _dicTripRepository.DeleteTemplateTripSharedThingsAsync(_currentUser.AdminId, tripId, ids);
    }

    public async Task<int> DeleteTemplateAiTripSharedThingsAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
        return await _dicTripRepository.DeleteTemplateAiTripSharedThingsAsync(_currentUser.AdminId, tripId, ids);
    }

    public async Task<int> AssignTripSharedThingsAsync(MultipleIdsAssignRequest request)
    {
        var tripId = request.CollectionId;
        var assigneeId = request.Id;
        var ids = request.Ids;
        var deadlineAt = request.DeadlineAt;

        _currentUser.RaiseIfNotAdmin();
        var before = await _tripSharedRepository.GetByIdsFullAsync(tripId, ids);
        var result = await _dicTripRepository.AssignTripSharedThingsAsync(_currentUser.AdminId, tripId, assigneeId, ids, deadlineAt, false);
        var after = await _tripSharedRepository.GetByIdsFullAsync(tripId, ids);
        await NotifyParticipantAssignmentChangesAsync(before, after, "shared items", "trip-shared");
        return result;
    }

    public async Task<int> UnassignTripSharedThingsAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
        var before = await _tripSharedRepository.GetByIdsFullAsync(tripId, ids);
        var result = await _dicTripRepository.AssignTripSharedThingsAsync(_currentUser.AdminId, tripId, Guid.Empty, ids, null, true);
        var after = await _tripSharedRepository.GetByIdsFullAsync(tripId, ids);
        await NotifyParticipantAssignmentChangesAsync(before, after, "shared items", "trip-shared");
        return result;
    }

    private async Task NotifyParticipantAssignmentChangesAsync(
        List<TripSharedThing> before,
        List<TripSharedThing> after,
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
        TripSharedThing entity,
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