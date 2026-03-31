using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using plantour_server.Utils;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripSharedExpenseService(
    TripSharedExpenseRepository tripSharedExpenseRepository,
    TripUserExpenseRepository tripUserExpenseRepository,
    TripRepository tripRepository,
    TripUserRepository tripUserRepository,
    CurrencyRepository currencyRepository,
    IExpenseCurrencyRateService expenseCurrencyRateService,
    ICheckAccessService checkAccessService,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser,
    DicTripRepository dicTripRepository,
    UsersRepository usersRepository,
    ISharedAssignmentNotificationService sharedAssignmentNotificationService) : ITripSharedExpenseService
{
    private readonly TripSharedExpenseRepository _tripSharedExpenseRepository = tripSharedExpenseRepository;
    private readonly TripUserExpenseRepository _tripUserExpenseRepository = tripUserExpenseRepository;
    private readonly TripRepository _tripRepository = tripRepository;
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
    private readonly CurrencyRepository _currencyRepository = currencyRepository;
    private readonly IExpenseCurrencyRateService _expenseCurrencyRateService = expenseCurrencyRateService;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly DicTripRepository _dicTripRepository = dicTripRepository;
    private readonly UsersRepository _usersRepository = usersRepository;
    private readonly ISharedAssignmentNotificationService _sharedAssignmentNotificationService = sharedAssignmentNotificationService;

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

    public async Task<IEnumerable<TripSharedExpenseDto>> GetAllForAssigneeAsync(Guid tripId, Guid assigneeId)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var items = (await _tripSharedExpenseRepository.GetAllFullForAssigneeAsync(tripId, assigneeId)).OrderBy(x => x.Id).ToList();
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
        await ValidateAssigneeAsync(request.TripId, request.AssignedToId);

        var entity = _mapper.Map<TripSharedExpense>(request);
        entity.Id = Guid.NewGuid();
        entity.AssignedAt = request.AssignedToId != null ? DateTime.UtcNow : null;
        entity.Rejected = false;
        entity.AssignedExpenseId = null;
        await _tripSharedExpenseRepository.AddAsync(entity);
        return _mapper.Map<TripSharedExpenseDto>(entity);
    }

    public async Task UpdateAsync(UpdateTripSharedExpenseRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        _ = await ValidateAndGetTripAsync(request.TripId);
        await ValidateAssigneeAsync(request.TripId, request.AssignedToId);

        var entity = (await _tripSharedExpenseRepository.FindAsync(x => x.Id == request.Id && x.TripId == request.TripId)).FirstOrDefault();
        if (entity == null)
        {
            throw new CustomException("Trip shared expense not found");
        }

        if (request.AssignedToId != entity.AssignedToId)
        {
            entity.AssignedAt = null;
            entity.Rejected = false;
            entity.AssignedExpenseId = null;
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

        var entity = (await _tripSharedExpenseRepository.FindAsync(x => x.Id == id && x.TripId == tripId))
            .FirstOrDefault();

        if (entity == null)
        {
            throw new CustomException("Trip shared expense not found");
        }

        if (entity.AssignedExpenseId != null)
        {
            throw new CustomException("accepted shared expense cannot be deleted while assigned; unassign it first");
        }

        await _tripSharedExpenseRepository.DeleteAsync(tripId, id);
    }

    public async Task<int> AssignTripSharedExpensesAsync(MultipleIdsAssignRequest request)
    {
        _currentUser.RaiseIfNotAdmin();
        var before = await _tripSharedExpenseRepository.GetByIdsFullAsync(request.CollectionId, request.Ids);
        var result = await _dicTripRepository.AssignTripSharedExpensesAsync(_currentUser.AdminId, request.CollectionId, request.Id, request.Ids, request.DeadlineAt, false);
        var after = await _tripSharedExpenseRepository.GetByIdsFullAsync(request.CollectionId, request.Ids);
        await NotifyParticipantAssignmentChangesAsync(before, after, "shared expenses", "trip-shared-expenses");
        return result;
    }

    public async Task<int> UnassignTripSharedExpensesAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();
        var before = await _tripSharedExpenseRepository.GetByIdsFullAsync(tripId, ids);
        var result = await _dicTripRepository.AssignTripSharedExpensesAsync(_currentUser.AdminId, tripId, Guid.Empty, ids, null, true);
        var after = await _tripSharedExpenseRepository.GetByIdsFullAsync(tripId, ids);
        await NotifyParticipantAssignmentChangesAsync(before, after, "shared expenses", "trip-shared-expenses");
        return result;
    }

    public async Task ToggleAcceptAssignmentAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = await _tripSharedExpenseRepository.GetByIdFullAsync(tripId, id) ?? throw new CustomException("Trip shared expense not found");

        if (entity.AssignedToId == null)
        {
            throw new CustomException("User does not have this shared expense assignee or no access");
        }

        var assignedToTripUser = await _tripUserRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, entity.TripId, entity.AssignedToId.Value);
        if (assignedToTripUser == null)
        {
            throw new CustomException("AssignedTo trip user not found");
        }

        var shouldNotifyAccepted = entity.AssignedExpenseId == null;
        if (shouldNotifyAccepted)
        {
            var expense = new TripUserExpense
            {
                Id = Guid.NewGuid(),
                TripUserId = assignedToTripUser.Id,
                Name = entity.Name,
                PaymentMethod = entity.PaymentMethod,
                CurrencyId = entity.CurrencyId,
                Amount = entity.Amount,
                Notes = entity.Notes,
                RecipientId = null,
                Rate = await ResolveRateAsync(entity.Trip, entity.CurrencyId)
            };

            expense = await _tripUserExpenseRepository.AddAsync(expense);
            entity.AssignedExpenseId = expense.Id;
            entity.Rejected = false;
        }
        else
        {
            var assignedExpenseId = entity.AssignedExpenseId ?? throw new CustomException("Assigned expense not found");
            var expense = await _tripUserExpenseRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, entity.TripId, assignedExpenseId);
            if (expense != null)
            {
                await _tripUserExpenseRepository.DeleteAsync(expense.Id);
            }

            entity.AssignedExpenseId = null;
        }

        await _tripSharedExpenseRepository.UpdateAsync(entity);

        if (shouldNotifyAccepted)
        {
            await NotifyAdminAboutParticipantActionAsync(entity, "shared expense", "trip-shared-expenses", "accepted");
        }
    }

    public async Task ToggleRejectAssignmentAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = await _tripSharedExpenseRepository.GetByIdFullAsync(tripId, id) ?? throw new CustomException("Trip shared expense not found");

        if (entity.AssignedToId == null)
        {
            throw new CustomException("User does not have this shared expense assignee or no access");
        }

        var assignedToTripUser = await _tripUserRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, entity.TripId, entity.AssignedToId.Value);
        if (assignedToTripUser == null)
        {
            throw new CustomException("AssignedTo trip user not found");
        }

        var shouldNotifyRejected = !entity.Rejected;

        if (entity.Rejected)
        {
            entity.Rejected = false;
        }
        else
        {
            entity.Rejected = true;

            if (entity.AssignedExpenseId != null)
            {
                var expense = await _tripUserExpenseRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, entity.TripId, entity.AssignedExpenseId.Value);
                if (expense != null)
                {
                    await _tripUserExpenseRepository.DeleteAsync(expense.Id);
                }

                entity.AssignedExpenseId = null;
            }
        }

        await _tripSharedExpenseRepository.UpdateAsync(entity);

        if (shouldNotifyRejected)
        {
            await NotifyAdminAboutParticipantActionAsync(entity, "shared expense", "trip-shared-expenses", "refused");
        }
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

    private async Task ValidateAssigneeAsync(Guid tripId, Guid? assignedToId)
    {
        if (!assignedToId.HasValue)
        {
            return;
        }

        var assignedToExists = await _tripUserRepository.AnyByIdAsync(_currentUser.AdminId, tripId, assignedToId.Value);
        if (!assignedToExists)
        {
            throw new CustomException("AssignedTo trip user not found or does not belong to the same trip");
        }
    }

    private async Task<decimal?> ResolveRateAsync(Trip trip, Guid? currencyId)
    {
        if (!currencyId.HasValue)
        {
            return null;
        }

        if (trip.CurrencyId == currencyId.Value)
        {
            return 1m;
        }

        var tripCurrency = await _currencyRepository.GetByIdAsync(trip.CurrencyId);
        var expenseCurrency = await _currencyRepository.GetByIdAsync(currencyId.Value);
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

    private async Task NotifyParticipantAssignmentChangesAsync(
        List<TripSharedExpense> before,
        List<TripSharedExpense> after,
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
                    AddParticipantAssignmentChange(grouped, beforeEntity.AssignedTo.AdminParticipant.Participant, "Unassigned", null, afterEntity.Name);
                }

                if (afterEntity.AssignedTo?.AdminParticipant?.Participant != null)
                {
                    AddParticipantAssignmentChange(grouped, afterEntity.AssignedTo.AdminParticipant.Participant, "Assigned", afterEntity.AssignedDeadline, afterEntity.Name);
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
        TripSharedExpense entity,
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