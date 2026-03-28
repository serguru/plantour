using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripNoteService(
    TripNoteRepository tripNoteRepository,
    TripUserRepository tripUserRepository,
    TripActivityRepository tripActivityRepository,
    ICheckAccessService checkAccessService,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser) : ITripNoteService
{
    private readonly TripNoteRepository _tripNoteRepository = tripNoteRepository;
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
    private readonly TripActivityRepository _tripActivityRepository = tripActivityRepository;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;

    private static TripNoteDto MapTripActivityName(TripNote note, TripNoteDto dto)
    {
        dto.TripActivityName = note.TripActivity?.Name;
        return dto;
    }

    private async Task<TripUser> GetRequiredTripUserAsync(Guid tripId)
    {
        var tripUser = await _tripUserRepository.GetByTripIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId);
        if (tripUser == null)
        {
            throw new CustomException("Trip user not found");
        }

        return tripUser;
    }

    private async Task ValidateTripActivityAsync(Guid tripId, Guid? tripActivityId, Guid tripUserId)
    {
        if (!tripActivityId.HasValue)
        {
            return;
        }

        var matches = await _tripActivityRepository.AnyAsync(x =>
            x.Id == tripActivityId.Value &&
            x.TripId == tripId &&
            (x.TripUserId == null || x.TripUserId == tripUserId));

        if (!matches)
        {
            throw new CustomException("Trip activity not found");
        }
    }

    public async Task<IEnumerable<TripNoteDto>> GetAllAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entities = await _tripNoteRepository.GetAllAsync(_currentUser.AdminId, _currentUser.UserId, tripId);
        return entities.Select(x => MapTripActivityName(x, _mapper.Map<TripNoteDto>(x)));
    }

    public async Task<TripNoteDto?> GetByIdAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = await _tripNoteRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        return entity != null ? MapTripActivityName(entity, _mapper.Map<TripNoteDto>(entity)) : null;
    }

    public async Task<TripNoteDto> AddAsync(CreateTripNoteRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripUser = await GetRequiredTripUserAsync(request.TripId);
        await ValidateTripActivityAsync(request.TripId, request.TripActivityId, tripUser.Id);

        var entity = _mapper.Map<TripNote>(request);
        entity.Id = Guid.NewGuid();
        entity.TripUserId = tripUser.Id;
        entity.CreatedAt = DateTime.UtcNow;

        await _tripNoteRepository.AddAsync(entity);

        if (entity.TripActivityId.HasValue)
        {
            entity.TripActivity = (await _tripActivityRepository.FindAsync(x => x.Id == entity.TripActivityId.Value)).FirstOrDefault();
        }

        return MapTripActivityName(entity, _mapper.Map<TripNoteDto>(entity));
    }

    public async Task UpdateAsync(UpdateTripNoteRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripUser = await GetRequiredTripUserAsync(request.TripId);
        await ValidateTripActivityAsync(request.TripId, request.TripActivityId, tripUser.Id);

        var entity = await _tripNoteRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, request.TripId, request.Id);
        if (entity == null)
        {
            throw new CustomException("Trip note not found or access denied");
        }

        _mapper.Map(request, entity);
        await _tripNoteRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var exists = await _tripNoteRepository.AnyByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        if (!exists)
        {
            throw new CustomException("Trip note not found or access denied");
        }

        await _tripNoteRepository.DeleteAsync(id);
    }
}