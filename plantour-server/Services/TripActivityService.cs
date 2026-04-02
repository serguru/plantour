using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripActivityService
(
    TripActivityRepository tripActivityRepository,
    ItineraryPartRepository itineraryPartRepository,
    TripUserRepository tripUserRepository,
    ICheckAccessService checkAccessService,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser
) : ITripActivityService
{
    private readonly TripActivityRepository _tripActivityRepository = tripActivityRepository;
    private readonly ItineraryPartRepository _itineraryPartRepository = itineraryPartRepository;
    private readonly IMapper _mapper = mapper;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;

    private async Task CheckAccessAsync(Guid tripId, int addQty, bool isPublic)
    {
        var rule = _currentUser.AccessRules!.FirstOrDefault(x => x.Id == 110);
        if (rule == null || rule.Granted)
        {
            return;
        }

        int limit = rule.Value ?? 0;

        var subject = isPublic ? "public activities" : "activities";
        var s1 = $"You've reached the limit of {limit} {subject} you can add to your trip.";

        var s2 = _currentUser.IsAdmin ? "Please go to your profile page and upgrade your plan to remove this limit." : "Please ask your administrator to upgrade the plan to remove this limit.";

        var currentCount = isPublic
            ? await _tripActivityRepository.CountPublicAsync(tripId)
            : await _tripActivityRepository.CountPersonalAsync(_currentUser.AdminId, _currentUser.UserId, tripId);

        if (currentCount + addQty > limit)
        {
            throw new CustomException($"{s1} {s2}", "PLAN_LIMIT_REACHED");
        }
    }

    private async Task CheckItineraryPart(Guid tripId, Guid? itineraryPartId)
    {
        if (itineraryPartId == null)
        {
            return;
        }

        var result = await _itineraryPartRepository.AnyAccessibleByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, itineraryPartId.Value);

        if (!result)
        {
            throw new CustomException("Itinerary part not found");
        }
    }

    public async Task<TripActivityDto> AddPersonalAsync(CreateTripActivityRequest request)
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

        await CheckItineraryPart(request.TripId, request.ItineraryPartId);
        await CheckAccessAsync(request.TripId, 1, false);

        var entity = _mapper.Map<TripActivity>(request);
        entity.Id = Guid.NewGuid();
        entity.TripUserId = tripUser.Id;
        await _tripActivityRepository.AddAsync(entity);
        return _mapper.Map<TripActivityDto>(entity);
    }
    public async Task<TripActivityDto> AddPublicAsync(CreateTripActivityRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        await CheckItineraryPart(request.TripId, request.ItineraryPartId);
        await CheckAccessAsync(request.TripId, 1, true);

        var entity = _mapper.Map<TripActivity>(request);
        entity.Id = Guid.NewGuid();
        entity.TripUserId = null;
        await _tripActivityRepository.AddAsync(entity);
        return _mapper.Map<TripActivityDto>(entity);
    }

    public async Task UpdatePersonalAsync(UpdateTripActivityRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        TripActivity? tripActivity = await _tripActivityRepository.GetByIdAsync(request.Id);

        if (tripActivity == null)
        {
            throw new CustomException("Trip activity not found");
        }

        if (tripActivity.TripUserId == null)
        {
            throw new CustomException("Trip activity must have a reference to the trip user");
        }

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripActivity.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripUser = await _tripUserRepository.GetByTripIdAsync(
            _currentUser.AdminId,
            _currentUser.UserId,
            tripActivity.TripId);

        if (tripUser == null)
        {
            throw new CustomException("Trip user not found");
        }

        if (tripActivity.TripUserId != tripUser.Id)
        {
            throw new CustomException("Trip user must be the same as trip activity trip user");
        }

        await CheckItineraryPart(tripActivity.TripId, request.ItineraryPartId);

        _mapper.Map(request, tripActivity);
        await _tripActivityRepository.UpdateAsync(tripActivity);
    }
    public async Task UpdatePublicAsync(UpdateTripActivityRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        TripActivity? tripActivity = await _tripActivityRepository.GetByIdAsync(request.Id);

        if (tripActivity == null)
        {
            throw new CustomException("Trip activity not found");
        }

        if (tripActivity.TripUserId != null)
        {
            throw new CustomException("Public trip activity must not have a reference to the trip user");
        }

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripActivity.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        await CheckItineraryPart(tripActivity.TripId, request.ItineraryPartId);

        _mapper.Map(request, tripActivity);
        await _tripActivityRepository.UpdateAsync(tripActivity);
    }
    public async Task DeletePersonalAsync(Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        TripActivity? tripActivity = await _tripActivityRepository.GetByIdAsync(id);

        if (tripActivity == null)
        {
            throw new CustomException("Trip activity not found");
        }

        if (tripActivity.TripUserId == null)
        {
            throw new CustomException("Trip activity must have a reference to the trip user");
        }

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripActivity.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripUser = await _tripUserRepository.GetByTripIdAsync(
            _currentUser.AdminId,
            _currentUser.UserId,
            tripActivity.TripId);

        if (tripUser == null)
        {
            throw new CustomException("Trip user not found");
        }

        if (tripActivity.TripUserId != tripUser.Id)
        {
            throw new CustomException("Trip user must be the same as trip activity trip user");
        }

        await _tripActivityRepository.DeleteAsync(id);
    }
    public async Task DeletePublicAsync(Guid id)
    {
        _currentUser.RaiseIfNotAdmin();

        TripActivity? tripActivity = await _tripActivityRepository.GetByIdAsync(id);

        if (tripActivity == null)
        {
            throw new CustomException("Trip activity not found");
        }

        if (tripActivity.TripUserId != null)
        {
            throw new CustomException("Trip activity must not have a reference to the trip user");
        }

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripActivity.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        await _tripActivityRepository.DeleteAsync(id);
    }

    public async Task<IEnumerable<TripActivityDto>> GetAllPersonalAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripUser = await _tripUserRepository.GetByTripIdAsync(
            _currentUser.AdminId,
            _currentUser.UserId,
            tripId);

        if (tripUser == null)
        {
            throw new CustomException("Trip user not found");
        }
        
        IEnumerable<TripActivity> tripActivities = await _tripActivityRepository.FindAsync(x => x.TripId == tripId && x.TripUserId == tripUser.Id);

        IEnumerable<TripActivityDto> result = _mapper.Map<IEnumerable<TripActivityDto>>(tripActivities);

        return result;
    }

    public async Task<IEnumerable<TripActivityDto>> GetAllPublicAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        IEnumerable<TripActivity> tripActivities = await _tripActivityRepository.FindAsync( x => x.TripId == tripId && x.TripUserId == null);

        IEnumerable<TripActivityDto> result = _mapper.Map<IEnumerable<TripActivityDto>>(tripActivities);

        return result;
    }

    public async Task<TripActivityDto?> GetPersonalByIdAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripUser = await _tripUserRepository.GetByTripIdAsync(
            _currentUser.AdminId,
            _currentUser.UserId,
            tripId);

        if (tripUser == null)
        {
            throw new CustomException("Trip user not found");
        }
        
        IEnumerable<TripActivity> tripActivities = await _tripActivityRepository.FindAsync(x => x.TripId == tripId && x.TripUserId == tripUser.Id && x.Id == id);

        if (!tripActivities.Any())
        {
            return null;
        }

        var raw = tripActivities.First();
        var result = _mapper.Map<TripActivityDto>(raw);
        return result;
    }

    public async Task<TripActivityDto?> GetPublicByIdAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        IEnumerable<TripActivity> tripActivities = await _tripActivityRepository.FindAsync(x => x.TripId == tripId && x.TripUserId == null && x.Id == id);

        if (!tripActivities.Any())
        {
            return null;
        }

        var raw = tripActivities.First();
        var result = _mapper.Map<TripActivityDto>(raw);
        return result;
    }
}