using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class ThingService(
    ILogger<TripService> logger,
    ThingRepository thingRepository,
    ThingCategoryRepository thingCategoryRepository,
    IMapper mapper,
    ICheckAccessService checkAccessService,
    TripThingRepository tripThingRepository,
    TripSharedRepository tripSharedRepository,
    DicTripRepository dicTripRepository,
    UserSettingsRepository userSettingsRepository,
    HttpCurrentUser httpCurrentUser) : IThingService
{
    private readonly ILogger<TripService> _logger = logger;
    private readonly ThingRepository _thingRepository = thingRepository;
    private readonly ThingCategoryRepository _thingCategoryRepository = thingCategoryRepository;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly TripThingRepository _tripThingRepository = tripThingRepository;
    private readonly TripSharedRepository _tripSharedRepository = tripSharedRepository;
    private readonly DicTripRepository _dicTripRepository = dicTripRepository;
    private readonly UserSettingsRepository _userSettingsRepository = userSettingsRepository;
    public async Task<IEnumerable<ThingDto>> GetAllAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entities = await _thingRepository.FindAsync(x => x.UserId == _currentUser.UserId);
        return _mapper.Map<IEnumerable<ThingDto>>(entities);
    }

    public async Task<IEnumerable<ThingDto>> GetAllForTripAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripThings = await _tripThingRepository.GetAllAsync(_currentUser.AdminId, _currentUser.UserId, tripId);
        var tripThingNames = new HashSet<string>(tripThings.Select(tp => tp.Name), StringComparer.OrdinalIgnoreCase);
        var dicThings = await _thingRepository.FindAsync(x => x.UserId == _currentUser.UserId);

        var result = dicThings.Select(p =>
        {
            var dto = _mapper.Map<ThingDto>(p);
            dto.IsTargeted = tripThingNames.Contains(p.Name, StringComparer.OrdinalIgnoreCase);
            return dto;
        }).ToList();

        return result;
    }

    public async Task<IEnumerable<ThingDto>> GetAllForTripSharedAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripSharedThings = await _tripSharedRepository.GetAllFullAsync(tripId);
        var tripThingNames = new HashSet<string>(tripSharedThings.Select(tp => tp.Name), StringComparer.OrdinalIgnoreCase);
        var dicThings = await _thingRepository.FindAsync(x => x.UserId == _currentUser.UserId);

        var result = dicThings.Select(p =>
        {
            var dto = _mapper.Map<ThingDto>(p);
            dto.IsTargeted = tripThingNames.Contains(p.Name, StringComparer.OrdinalIgnoreCase);
            return dto;
        }).ToList();

        return result;
    }

    public async Task<ThingDto?> GetByIdAsync(Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entity = await _thingRepository.GetByIdAsync(_currentUser.UserId, id);
        return entity != null ? _mapper.Map<ThingDto>(entity) : null;
    }

    public async Task<ThingDto> AddAsync(CreateThingRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (await _thingRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Name.ToLower() == request.Name.ToLower()))
        {
            throw new CustomException("Item with the same name already exists");
        }
        await CheckAccessAsync(1);
        var entity = _mapper.Map<UserThing>(request);
        entity.Id = Guid.NewGuid();
        entity.UserId = _currentUser.UserId;
        await _thingRepository.AddAsync(entity);

        StartEndDates? dates = await _userSettingsRepository.GetUserEntitiesLogging(_currentUser.AdminId);
        DateTime now = DateTime.UtcNow;
        var logNeeded = dates != null && dates.Start <= now && now <= dates.End;
        if (logNeeded)
        {
            _logger.LogInformation("User added an item id = {thingId}, name = {name}, event_type: {event_type}, subtype: {subtype}", entity!.Id, entity.Name, "user_log_entities", "item_added");
        }
        return _mapper.Map<ThingDto>(entity);
    }

    public async Task UpdateAsync(UpdateThingRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entity = await _thingRepository.GetByIdAsync(_currentUser.UserId, request.Id);
        if (entity == null)
        {
            throw new CustomException("Item not found or access denied");
        }

        if (await _thingRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Name.ToLower() == request.Name.ToLower() && x.Id != request.Id))
        {
            throw new CustomException("Another item with the same name already exists");
        }

        _mapper.Map(request, entity);
        entity.UserId = _currentUser.UserId;
        await _thingRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var exists = await _thingRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Id == id);
        if (!exists)
        {
            throw new CustomException("Item not found or access denied");
        }

        StartEndDates? dates = await _userSettingsRepository.GetUserEntitiesLogging(_currentUser.AdminId);

        DateTime now = DateTime.UtcNow;
        var logNeeded = dates != null && dates.Start <= now && now <= dates.End;
        UserThing? thing = null;
        if (logNeeded)
        {
            thing = await _thingRepository.GetByIdAsync(id) ?? throw new CustomException("Item not found");
        }

        await _thingRepository.DeleteAsync(id);

        if (logNeeded)
        {
            _logger.LogInformation("User deleted an item id = {thingId}, name = {name}, event_type: {event_type}, subtype: {subtype}", thing!.Id, thing.Name, "user_log_entities", "item_deleted");
        }

    }

    public async Task<IEnumerable<ThingCategoryDto>> GetAllThingCategoriesAsync()
    {
        var categories = await _thingCategoryRepository.GetAllAsync();
        return categories.Select(c => new ThingCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Notes = c.Notes
        });
    }


    public async Task<int> InsertTemplateUserThingsAsync(Guid[] ids)
    {
        _currentUser.RaiseIfNotAuthenticated();
        await CheckAccessAsync(ids.Length);
        return await _dicTripRepository.InsertTemplateUserThingsAsync(_currentUser.UserId, ids);
    }


    private async Task CheckAccessAsync(int addQty)
    {
        var rule = _currentUser.AccessRules!.FirstOrDefault(x => x.Id == 40);
        var granted = rule!.Granted;

        if (granted)
        {
            return;
        }

        int limit = rule.Value!.Value;

        var s1 = $"You've reached the limit of {limit} items you can add to your trip.";

        var s2 = _currentUser.IsAdmin ? "Please go to your profile page and upgrade your plan to remove this limit." : "Please ask your administrator to upgrade the plan to remove this limit.";


        var currentCount = await _thingRepository.CountAsync(_currentUser.UserId);
        if (currentCount + addQty > limit)
        {
            throw new CustomException($"{s1} {s2}", "PLAN_LIMIT_REACHED");
        }
    }


    public async Task<int> InsertTemplateAiUserThingsAsync(Guid[] ids)
    {
        _currentUser.RaiseIfNotAuthenticated();
        await CheckAccessAsync(ids.Length);
        return await _dicTripRepository.InsertTemplateAiUserThingsAsync(_currentUser.UserId, ids);
    }

    public async Task<int> DeleteTemplateUserThingsAsync(Guid[] ids)
    {
        _currentUser.RaiseIfNotAuthenticated();
        return await _dicTripRepository.DeleteTemplateUserThingsAsync(_currentUser.UserId, ids);
    }

    public async Task<int> DeleteTemplateAiUserThingsAsync(Guid[] ids)
    {
        _currentUser.RaiseIfNotAuthenticated();
        return await _dicTripRepository.DeleteTemplateAiUserThingsAsync(_currentUser.UserId, ids);
    }

    // public async Task<int> InsertFromAiTemplateAsync(IEnumerable<AiItemDto> items)
    // {
    //     _currentUser.RaiseIfNotAuthenticated();

    //     var existingThings = await _thingRepository.FindAsync(x => x.UserId == _currentUser.UserId);
    //     var existingNames = new HashSet<string>(
    //         existingThings.Select(t => t.Name),
    //         StringComparer.OrdinalIgnoreCase);

    //     var newItems = items
    //         .Where(i => !string.IsNullOrWhiteSpace(i.Name))
    //         .GroupBy(i => i.Name, StringComparer.OrdinalIgnoreCase)
    //         .Select(g => g.First())
    //         .Where(i => !existingNames.Contains(i.Name));

    //     var entities = newItems.Select(i => new UserThing
    //     {
    //         Id = Guid.NewGuid(),
    //         UserId = _currentUser.UserId,
    //         Category = string.IsNullOrWhiteSpace(i.Category) ? null : i.Category,
    //         Name = i.Name,
    //         Units = string.IsNullOrWhiteSpace(i.Units) ? null : i.Units,
    //         Value = i.Value,
    //         Notes = string.IsNullOrWhiteSpace(i.Notes) ? null : i.Notes,
    //         Shared = false
    //     }).ToList();

    //     if (entities.Count == 0)
    //     {
    //         return 0;
    //     }

    //     await _thingRepository.AddRangeAsync(entities);
    //     return entities.Count;
    // }


}
