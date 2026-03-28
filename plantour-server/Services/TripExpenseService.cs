using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripExpenseService(
    TripUserExpenseRepository tripUserExpenseRepository,
    TripRepository tripRepository,
    TripUserRepository tripUserRepository,
    CurrencyRepository currencyRepository,
    IExpenseCurrencyRateService expenseCurrencyRateService,
    ICheckAccessService checkAccessService,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser) : ITripExpenseService
{
    private readonly TripUserExpenseRepository _tripUserExpenseRepository = tripUserExpenseRepository;
    private readonly TripRepository _tripRepository = tripRepository;
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
    private readonly CurrencyRepository _currencyRepository = currencyRepository;
    private readonly IExpenseCurrencyRateService _expenseCurrencyRateService = expenseCurrencyRateService;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;

    public async Task<IEnumerable<TripExpenseDto>> GetAllAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entities = await _tripUserExpenseRepository.GetAllAsync(_currentUser.AdminId, _currentUser.UserId, tripId);
        return _mapper.Map<IEnumerable<TripExpenseDto>>(entities.OrderBy(x => x.Id));
    }

    public async Task<IEnumerable<TripExpenseDto>> GetAllForTripAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entities = await _tripUserExpenseRepository.GetAllForTripAsync(_currentUser.AdminId, tripId);
        return _mapper.Map<IEnumerable<TripExpenseDto>>(entities.OrderBy(x => x.Id));
    }

    public async Task<TripExpenseDto?> GetByIdAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entity = await _tripUserExpenseRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        return entity != null ? _mapper.Map<TripExpenseDto>(entity) : null;
    }

    public async Task<decimal> GetSuggestedRateAsync(Guid tripId, Guid currencyId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var trip = await _tripRepository.GetByIdAsync(tripId);
        if (trip == null)
        {
            throw new CustomException("Trip not found");
        }

        return await ResolveRateAsync(trip, currencyId);
    }

    public async Task<TripExpenseDto> AddAsync(CreateTripExpenseRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        var (trip, tripUser) = await ValidateAndGetTripContextAsync(request.TripId);
        await ValidateRecipientAsync(request.TripId, tripUser.Id, request.RecipientId);

        var entity = _mapper.Map<TripUserExpense>(request);
        entity.Id = Guid.NewGuid();
        entity.TripUserId = tripUser.Id;

        await ApplyCurrencyAsync(trip, entity, request.CurrencyId, request.Rate);
        await _tripUserExpenseRepository.AddAsync(entity);
        return _mapper.Map<TripExpenseDto>(entity);
    }

    public async Task UpdateAsync(UpdateTripExpenseRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        var (trip, tripUser) = await ValidateAndGetTripContextAsync(request.TripId);
        var entity = await _tripUserExpenseRepository.GetByIdWithSharedDetailsAsync(_currentUser.AdminId, _currentUser.UserId, request.TripId, request.Id);
        if (entity == null)
        {
            throw new CustomException("Trip expense not found or access denied");
        }

        if (request.RecipientId != null && entity.TripSharedExpenses.Any())
        {
            throw new CustomException("An accepted shared expense cannot also have a recipient.");
        }

        await ValidateRecipientAsync(request.TripId, tripUser.Id, request.RecipientId);

        _mapper.Map(request, entity);
        await ApplyCurrencyAsync(trip, entity, request.CurrencyId, request.Rate);
        await _tripUserExpenseRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var exists = await _tripUserExpenseRepository.AnyByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        if (!exists)
        {
            throw new CustomException("Trip expense not found or access denied");
        }

        await _tripUserExpenseRepository.DeleteAsync(id);
    }

    private async Task<(Trip Trip, TripUser TripUser)> ValidateAndGetTripContextAsync(Guid tripId)
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

        var tripUser = await _tripUserRepository.GetByTripIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId);
        if (tripUser == null)
        {
            throw new CustomException("Trip user not found");
        }

        return (trip, tripUser);
    }

    private async Task ValidateRecipientAsync(Guid tripId, Guid currentTripUserId, Guid? recipientId)
    {
        if (!recipientId.HasValue)
        {
            return;
        }

        if (recipientId.Value == currentTripUserId)
        {
            throw new CustomException("Recipient must be another participant of the trip");
        }

        var exists = await _tripUserRepository.AnyByIdAsync(_currentUser.AdminId, tripId, recipientId.Value);
        if (!exists)
        {
            throw new CustomException("Recipient trip participant not found or does not belong to the same trip");
        }
    }

    private async Task ApplyCurrencyAsync(Trip trip, TripUserExpense entity, Guid? requestedCurrencyId, decimal? requestedRate)
    {
        if (!requestedCurrencyId.HasValue)
        {
            entity.CurrencyId = null;
            entity.Rate = null;
            return;
        }

        entity.CurrencyId = requestedCurrencyId.Value;

        if (trip.CurrencyId == requestedCurrencyId.Value)
        {
            entity.Rate = 1m;
            return;
        }

        if (requestedRate.HasValue)
        {
            if (requestedRate.Value <= 0)
            {
                throw new CustomException("Rate must be greater than zero.");
            }

            entity.Rate = requestedRate.Value;
            return;
        }

        entity.Rate = await ResolveRateAsync(trip, requestedCurrencyId.Value);
    }

    private async Task<decimal> ResolveRateAsync(Trip trip, Guid requestedCurrencyId)
    {
        if (trip.CurrencyId == requestedCurrencyId)
        {
            return 1m;
        }

        var tripCurrency = await _currencyRepository.GetByIdAsync(trip.CurrencyId);
        var expenseCurrency = await _currencyRepository.GetByIdAsync(requestedCurrencyId);

        if (tripCurrency == null || expenseCurrency == null)
        {
            throw new CustomException("Currency not found");
        }

        var rate = await _expenseCurrencyRateService.TryGetRateAsync(expenseCurrency.Name, tripCurrency.Name);
        if (!rate.HasValue)
        {
            throw new CustomException("Unable to resolve exchange rate for the selected currency. No changes were saved.");
        }

        return rate.Value;
    }
}