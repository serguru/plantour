using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripImprovementService(
    TripImprovementRepository tripImprovementRepository,
    TripUserRepository tripUserRepository,
    ICheckAccessService checkAccessService,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser) : ITripImprovementService
{
    private readonly TripImprovementRepository _tripImprovementRepository = tripImprovementRepository;
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;

    private void EnsureExtendedAiAllowed()
    {
        var rule = _currentUser.AccessRules?.FirstOrDefault(x => x.Id == 60);
        if (rule?.Granted == true)
        {
            return;
        }

        throw new CustomException("Extend your plan to access");
    }

    private static void ValidateFinishedValue(string? finished)
    {
        if (finished == null || finished == "success" || finished == "failure")
        {
            return;
        }

        throw new CustomException("Invalid improvement status");
    }

    public async Task<IEnumerable<TripImprovementDto>> GetAllAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();
        EnsureExtendedAiAllowed();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entities = await _tripImprovementRepository.GetAllAsync(_currentUser.AdminId, _currentUser.UserId, tripId);
        return _mapper.Map<IEnumerable<TripImprovementDto>>(entities);
    }

    public async Task<TripImprovementDto?> GetByIdAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        EnsureExtendedAiAllowed();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = await _tripImprovementRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        return entity != null ? _mapper.Map<TripImprovementDto>(entity) : null;
    }

    public async Task<TripImprovementDto> AddAsync(CreateTripImprovementRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();
        EnsureExtendedAiAllowed();
        ValidateFinishedValue(request.Finished);

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

        var trimmedName = request.Name.Trim();

        var sameNameExists = await _tripImprovementRepository.AnyAsync(x =>
            x.TripUserId == tripUser.Id &&
            x.Name.ToLower() == trimmedName.ToLower());

        if (sameNameExists)
        {
            throw new CustomException("Improvement with the same name already exists");
        }

        var sameOrderExists = await _tripImprovementRepository.AnyAsync(x =>
            x.TripUserId == tripUser.Id &&
            x.ImprovementOrder == request.ImprovementOrder);

        if (sameOrderExists)
        {
            throw new CustomException("Improvement order must be unique within the trip");
        }

        var entity = _mapper.Map<TripUserImprovement>(request);
        entity.Id = Guid.NewGuid();
        entity.TripUserId = tripUser.Id;
        entity.Name = trimmedName;
        entity.Notes = request.Notes?.Trim();
        entity.Finished = request.Finished;

        await _tripImprovementRepository.AddAsync(entity);
        return _mapper.Map<TripImprovementDto>(entity);
    }

    public async Task UpdateAsync(UpdateTripImprovementRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();
        EnsureExtendedAiAllowed();
        ValidateFinishedValue(request.Finished);

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

        var trimmedName = request.Name.Trim();

        var sameNameExists = await _tripImprovementRepository.AnyAsync(x =>
            x.TripUserId == tripUser.Id &&
            x.Name.ToLower() == trimmedName.ToLower() &&
            x.Id != request.Id);

        if (sameNameExists)
        {
            throw new CustomException("Improvement with the same name already exists");
        }

        var sameOrderExists = await _tripImprovementRepository.AnyAsync(x =>
            x.TripUserId == tripUser.Id &&
            x.ImprovementOrder == request.ImprovementOrder &&
            x.Id != request.Id);

        if (sameOrderExists)
        {
            throw new CustomException("Improvement order must be unique within the trip");
        }

        var entity = await _tripImprovementRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, request.TripId, request.Id);
        if (entity == null)
        {
            throw new CustomException("Trip improvement not found or access denied");
        }

        _mapper.Map(request, entity);
        entity.Name = trimmedName;
        entity.Notes = request.Notes?.Trim();
        entity.Finished = request.Finished;

        await _tripImprovementRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        EnsureExtendedAiAllowed();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var exists = await _tripImprovementRepository.AnyByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        if (!exists)
        {
            throw new CustomException("Trip improvement not found or access denied");
        }

        await _tripImprovementRepository.DeleteAsync(id);
    }

    public async Task ToggleFinishedAsync(Guid tripId, Guid id, string? finished)
    {
        _currentUser.RaiseIfNotAuthenticated();
        EnsureExtendedAiAllowed();
        ValidateFinishedValue(finished);

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = await _tripImprovementRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        if (entity == null)
        {
            throw new CustomException("Trip improvement not found or access denied");
        }

        entity.Finished = finished;
        await _tripImprovementRepository.UpdateAsync(entity);
    }
}