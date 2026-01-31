using AutoMapper;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TemplateService(
    TemplateRepository templateRepository,
    ThingCategoryRepository thingCategoryRepository,
    IMapper mapper,
    ICheckAccessService checkAccessService,
    TripThingRepository tripThingRepository,
    TripSharedRepository tripSharedRepository,
    ThingRepository thingsRepository,
    HttpCurrentUser httpCurrentUser) : ITemplateService
{
    private readonly TemplateRepository _templateRepository = templateRepository;
    private readonly ThingCategoryRepository _thingCategoryRepository = thingCategoryRepository;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly TripThingRepository _tripThingRepository = tripThingRepository;
    private readonly TripSharedRepository _tripSharedRepository = tripSharedRepository;
    private readonly ThingRepository _thingsRepository = thingsRepository;

    public async Task<IEnumerable<VTemplateThingsFullDto>> GetAllAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entities = await _templateRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<VTemplateThingsFullDto>>(entities);
    }

    public async Task<IEnumerable<VTemplateThingsFullDto>> GetAllForTripAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripThings = await _tripThingRepository.GetAllAsync(_currentUser.AdminId, _currentUser.UserId, tripId);
        var tripThingNames = new HashSet<string>(tripThings.Select(tp => tp.Name), StringComparer.OrdinalIgnoreCase);
        var dicTemplateThings = await _templateRepository.GetAllAsync();

        var result = dicTemplateThings.Select(p =>
        {
            var dto = _mapper.Map<VTemplateThingsFullDto>(p);
            dto.IsTargeted = tripThingNames.Contains(p.ThingName, StringComparer.OrdinalIgnoreCase);
            return dto;
        }).ToList();

        return result;
    }   

    public async Task<IEnumerable<VTemplateThingsFullDto>> GetAllForTripSharedAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripSharedThings = await _tripSharedRepository.GetAllFullAsync(tripId);
        var tripThingNames = new HashSet<string>(tripSharedThings.Select(tp => tp.Name), StringComparer.OrdinalIgnoreCase);
        var dicTemplateThings = await _templateRepository.GetAllAsync();

        var result = dicTemplateThings.Select(p =>
        {
            var dto = _mapper.Map<VTemplateThingsFullDto>(p);
            dto.IsTargeted = tripThingNames.Contains(p.ThingName, StringComparer.OrdinalIgnoreCase);
            return dto;
        }).ToList();

        return result;
    }   

    public async Task<IEnumerable<VTemplateThingsFullDto>> GetAllForDicAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();

        var targetThings = await _thingsRepository.FindAsync(x => x.UserId == _currentUser.UserId);
        var targetThingNames = new HashSet<string>(targetThings.Select(tp => tp.Name), StringComparer.OrdinalIgnoreCase);
        var dicTemplateThings = await _templateRepository.GetAllAsync();

        var result = dicTemplateThings.Select(p =>
        {
            var dto = _mapper.Map<VTemplateThingsFullDto>(p);
            dto.IsTargeted = targetThingNames.Contains(p.ThingName, StringComparer.OrdinalIgnoreCase);
            return dto;
        }).ToList();

        return result;
    }   


    

}
