using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class ItineraryPartService(
    ItineraryPartRepository itineraryPartRepository,
    ICheckAccessService checkAccessService,
    HttpCurrentUser httpCurrentUser,
    IMapper mapper) : IItineraryPartService
{
    private readonly ItineraryPartRepository _itineraryPartRepository = itineraryPartRepository;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly IMapper _mapper = mapper;

    private async Task CheckAccessAsync(Guid tripId, int addQty)
    {
        var rule = _currentUser.AccessRules!.FirstOrDefault(x => x.Id == 100);
        if (rule == null || rule.Granted)
        {
            return;
        }

        int limit = rule.Value ?? 0;

        var s1 = $"You've reached the limit of {limit} itinerary parts you can add to your trip.";

        var s2 = _currentUser.IsAdmin ? "Please go to your profile page and upgrade your plan to remove this limit." : "Please ask your administrator to upgrade the plan to remove this limit.";


        var currentCount = await _itineraryPartRepository.CountAsync(tripId);
        if (currentCount + addQty > limit)
        {
            throw new CustomException($"{s1} {s2}", "PLAN_LIMIT_REACHED");
        }
    }

    public async Task<IEnumerable<ItineraryPartDto>> GetAllAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entities = await _itineraryPartRepository.GetAllAsync(_currentUser.AdminId, _currentUser.UserId, tripId);
        return _mapper.Map<List<ItineraryPartDto>>(entities);
    }

    public async Task<ItineraryPartDto?> GetByIdAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = await _itineraryPartRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        return entity == null ? null : _mapper.Map<ItineraryPartDto>(entity);
    }

    public async Task<ItineraryPartDto> AddAsync(CreateItineraryPartRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        await EnsureTripAccessAsync(request.TripId);
        await EnsureUniqueAsync(request.TripId, request.Name, request.StartDate, null);
        await CheckAccessAsync(request.TripId, 1);

        var entity = _mapper.Map<ItineraryPart>(request);
        entity.Id = Guid.NewGuid();

        await _itineraryPartRepository.AddAsync(entity);
        return _mapper.Map<ItineraryPartDto>(entity);
    }

    public async Task UpdateAsync(UpdateItineraryPartRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        await EnsureTripAccessAsync(request.TripId);
        await EnsureUniqueAsync(request.TripId, request.Name, request.StartDate, request.Id);

        var entity = await _itineraryPartRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, request.TripId, request.Id);
        if (entity == null)
        {
            throw new CustomException("Itinerary part not found or access denied");
        }

        _mapper.Map(request, entity);
        await _itineraryPartRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        await EnsureTripAccessAsync(tripId);

        var exists = await _itineraryPartRepository.AnyAccessibleByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        if (!exists)
        {
            throw new CustomException("Itinerary part not found or access denied");
        }

        await _itineraryPartRepository.DeleteAsync(id);
    }

    private async Task EnsureTripAccessAsync(Guid tripId)
    {
        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }
    }

    private async Task EnsureUniqueAsync(Guid tripId, string name, DateTime startDate, Guid? id)
    {
        var exists = await _itineraryPartRepository.AnyAsync(x =>
            x.TripId == tripId &&
            x.Name.ToLower() == name.ToLower() &&
            x.StartDate == startDate &&
            (!id.HasValue || x.Id != id.Value));

        if (exists)
        {
            throw new CustomException("Itinerary part with the same name and start date already exists");
        }
    }
}