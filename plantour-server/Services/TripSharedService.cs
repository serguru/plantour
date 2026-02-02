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
    TripUserRepository tripUserRepository,
    ThingRepository thingRepository,
    TripThingRepository tripThingRepository

    ) : ITripSharedService
{
    private readonly TripSharedRepository _tripSharedRepository = tripSharedRepository;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly DicTripRepository _dicTripRepository = dicTripRepository;
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
    private readonly ThingRepository _thingRepository = thingRepository;
    private readonly TripThingRepository _tripThingRepository = tripThingRepository;

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

    public async Task<int> InsertFromAiTemplateAsync(Guid tripId, IEnumerable<AiItemDto> things)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var existingThings = await _tripSharedRepository.GetAllFullAsync(tripId);
        var existingNames = new HashSet<string>(
            existingThings.Select(t => t.Name),
            StringComparer.OrdinalIgnoreCase);

        var newThings = things
            .Where(i => !string.IsNullOrWhiteSpace(i.Name))
            .GroupBy(i => i.Name, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.First())
            .Where(i => !existingNames.Contains(i.Name));

        var entities = newThings.Select(i => new TripSharedThing
        {
            Id = Guid.NewGuid(),
            TripId = tripId,
            Category = string.IsNullOrWhiteSpace(i.Category) ? null : i.Category,
            Name = i.Name,
            Units = string.IsNullOrWhiteSpace(i.Units) ? null : i.Units,
            Value = i.Value,
            Notes = string.IsNullOrWhiteSpace(i.Notes) ? null : i.Notes,
            AssignedToId = null,
            AssignedThingId = null,
            AssignedAt = null,
            AssignedDeadline = null,
            Rejected = false
        }).ToList();

        if (entities.Count == 0)
        {
            return 0;
        }

        await _tripSharedRepository.AddRangeAsync(entities);
        return entities.Count;
    }

    public async Task ToggleAcceptAssignmentAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotParticipant();

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

        if (entity.AssignedThingId == null) // accept
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
            var thing = await _tripThingRepository.GetByIdAsync(
                _currentUser.AdminId,
                _currentUser.UserId,
                entity.TripId,
                entity.AssignedThingId.Value);

            if (thing != null)
            {
                await _tripThingRepository.DeleteAsync(thing.Id);
            }                

            entity.AssignedThingId = null;
        }
        await _tripSharedRepository.UpdateAsync(entity);
    }

    public async Task ToggleRejectAssignmentAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotParticipant();

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
    }


    public async Task<int> InsertTemplateTripSharedThingsAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
        return await _dicTripRepository.InsertTemplateTripSharedThingsAsync(_currentUser.AdminId, tripId, ids);
    }

    public async Task<int> InsertTemplateAiTripSharedThingsAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
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
        var deadlineDays = request.DeadlineDays;

        _currentUser.RaiseIfNotAdmin();
        return await _dicTripRepository.AssignTripSharedThingsAsync(_currentUser.AdminId, tripId, assigneeId, ids, deadlineDays, false);
    }

    public async Task<int> UnassignTripSharedThingsAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
        return await _dicTripRepository.AssignTripSharedThingsAsync(_currentUser.AdminId, tripId, Guid.Empty, ids, 0, true);
    }
}