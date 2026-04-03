using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripSharedExpenseService(
    TripSharedExpenseRepository tripSharedExpenseRepository,
    TripRepository tripRepository,
    ICheckAccessService checkAccessService,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser) : ITripSharedExpenseService
{
    private readonly TripSharedExpenseRepository _tripSharedExpenseRepository = tripSharedExpenseRepository;
    private readonly TripRepository _tripRepository = tripRepository;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;

    private async Task CheckAccessAsync(Guid tripId, int addQty)
    {
        var rule = _currentUser.AccessRules!.FirstOrDefault(x => x.Id == 90);
        if (rule == null || rule.Granted)
        {
            return;
        }

        var limit = rule.Value ?? 0;
        var currentCount = await _tripSharedExpenseRepository.CountAsync(tripId);
        if (currentCount + addQty > limit)
        {
            var lead = $"You've reached the limit of {limit} shared expenses you can add to your trip.";
            var tail = _currentUser.IsAdmin
                ? "Please go to your profile page and upgrade your plan to remove this limit."
                : "Please ask your administrator to upgrade the plan to remove this limit.";
            throw new CustomException($"{lead} {tail}", "PLAN_LIMIT_REACHED");
        }
    }

    public async Task<IEnumerable<TripSharedExpenseDto>> GetAllFullAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var items = (await _tripSharedExpenseRepository.GetAllFullAsync(tripId)).OrderBy(x => x.Id).ToList();
        return _mapper.Map<IEnumerable<TripSharedExpenseDto>>(items);
    }

    public async Task<TripSharedExpenseDto?> GetByIdAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = await _tripSharedExpenseRepository.GetByIdFullAsync(tripId, id);
        return _mapper.Map<TripSharedExpenseDto?>(entity);
    }

    public async Task<TripSharedExpenseDto> AddAsync(CreateTripSharedExpenseRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        _ = await ValidateAndGetTripAsync(request.TripId);
        await CheckAccessAsync(request.TripId, 1);

        var entity = _mapper.Map<TripSharedExpense>(request);
        entity.Id = Guid.NewGuid();
        await _tripSharedExpenseRepository.AddAsync(entity);
        return _mapper.Map<TripSharedExpenseDto>(entity);
    }

    public async Task UpdateAsync(UpdateTripSharedExpenseRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        _ = await ValidateAndGetTripAsync(request.TripId);

        var entity = (await _tripSharedExpenseRepository.FindAsync(x => x.Id == request.Id && x.TripId == request.TripId)).FirstOrDefault();
        if (entity == null)
        {
            throw new CustomException("Trip shared expense not found");
        }

        _mapper.Map(request, entity);
        await _tripSharedExpenseRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = (await _tripSharedExpenseRepository.FindAsync(x => x.Id == id && x.TripId == tripId)).FirstOrDefault();
        if (entity == null)
        {
            throw new CustomException("Trip shared expense not found");
        }

        await _tripSharedExpenseRepository.DeleteAsync(tripId, id);
    }

    private async Task<Trip> ValidateAndGetTripAsync(Guid tripId)
    {
        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var trip = await _tripRepository.GetByIdAsync(tripId);
        if (trip == null || trip.UserId != _currentUser.AdminId)
        {
            throw new CustomException("Trip not found");
        }

        return trip;
    }
}