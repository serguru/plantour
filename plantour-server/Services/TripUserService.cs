using System.Globalization;
using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Logging;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using plantour_server.Utils;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripUserService(
    TripUserRepository tripUserRepository,
    TripSharedExpenseRepository tripSharedExpenseRepository,
    UsersRepository usersRepository,
    ICheckAccessService checkAccessService,
    DicTripRepository dicTripRepository,
    AdminsParticipantRepository adminsParticipantRepository,
    TripRepository tripRepository,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser,
    IEmailService emailService,
    SettingsRepository settingsRepository,
    IPlantourLogger logger) : ITripUserService
{
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
    private readonly TripSharedExpenseRepository _tripSharedExpenseRepository = tripSharedExpenseRepository;
    private readonly UsersRepository _usersRepository = usersRepository;
    private readonly IMapper _mapper = mapper;
    private readonly DicTripRepository _dicTripRepository = dicTripRepository;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly AdminsParticipantRepository _adminsParticipantRepository = adminsParticipantRepository;
    private readonly TripRepository _tripRepository = tripRepository;
    private readonly IEmailService _emailService = emailService;
    private readonly SettingsRepository _settingsRepository = settingsRepository;
    private readonly IPlantourLogger _logger = logger;

    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;


    private async Task CheckAccessAsync(Guid tripId, int addQty)
    {
        var rule = _currentUser.AccessRules!.FirstOrDefault(x => x.Id == 50);
        var granted = rule!.Granted;

        if (granted)
        {
            return;
        }

        int limit = rule.Value!.Value;

        var s1 = $"You've reached the limit of {limit} participants you can add to your trip.";

        var s2 = _currentUser.IsAdmin ? "Please go to your profile page and upgrade your plan to remove this limit." : "Please ask your administrator to upgrade the plan to remove this limit.";


        var currentCount = await _tripUserRepository.CountAsync(_currentUser.AdminId, tripId);
        if (currentCount + addQty > limit)
        {
            throw new CustomException($"{s1} {s2}", "PLAN_LIMIT_REACHED");
        }
    }

    public async Task<int> InsertTripUsersAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        await CheckAccessAsync(tripId, ids.Length);
        var insertedCount = await _dicTripRepository.InsertTripUsersAsync(_currentUser.AdminId, tripId, ids);

        if (insertedCount > 0)
        {
            await NotifyTripParticipantAddedAsync(tripId, ids);
        }

        return insertedCount;
    }

    public async Task<int> DeleteTripUsersAsync(Guid tripId, Guid[] ids)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        return await _dicTripRepository.DeleteTripUsersAsync(_currentUser.AdminId, tripId, ids);
    }

    public async Task<IEnumerable<TripUserDto>> GetAllAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();
        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }
        var entities = await _tripUserRepository.GetAllAsync(_currentUser.AdminId, tripId);
        var dtos = _mapper.Map<IEnumerable<TripUserDto>>(entities);
        dtos = dtos.Select((dto, index) => PopulateTripUserStats(dto, entities.ElementAt(index)));
        return dtos;
    }

    public async Task<TripUserDto?> GetByIdAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }
        var entity = await _tripUserRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);

        if (entity == null)
        {
            return null;
        }

        var dto = _mapper.Map<TripUserDto>(entity);
        return PopulateTripUserStats(dto, entity);
    }

    public async Task<TripUserDto?> GetByIdForAllAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }
        var entity = await _tripUserRepository.GetByIdForAllAsync(_currentUser.AdminId, tripId, id);

        if (entity == null)
        {
            return null;
        }

        var dto = _mapper.Map<TripUserDto>(entity);
        return PopulateTripUserStats(dto, entity);
    }

    public async Task<TripUserDto> AddAsync(CreateTripUserRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        if (!await _adminsParticipantRepository.AnyAsync(x =>
                x.AdminId == _currentUser.AdminId &&
                x.Id == request.AdminParticipantId))
        {
            throw new CustomException("AdminParticipant not found or access denied");
        }

        if (await _tripUserRepository.AnyAsync(x =>
                x.TripId == request.TripId &&
                x.AdminParticipantId == request.AdminParticipantId))
        {
            throw new CustomException("Trip User already exists for this trip");
        }

        await CheckAccessAsync(request.TripId, 1);
        var entity = _mapper.Map<TripUser>(request);
        entity.Id = Guid.NewGuid();
        entity.SharedAmount = 0;
        entity.AssignedAt = null;
        entity.AssignedDeadline = null;
        entity.Rejected = false;
        await _tripUserRepository.AddAsync(entity);
        await NotifyTripParticipantAddedAsync(request.TripId, new[] { request.AdminParticipantId });
        return _mapper.Map<TripUserDto>(entity);
    }

    public async Task UpdateAsync(UpdateTripUserRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = await _tripUserRepository.GetByIdForAllAsync(_currentUser.AdminId, request.TripId, request.Id);
        if (entity == null)
        {
            throw new CustomException("Trip User does not exist for this trip");
        }

        if (entity.AdminParticipantId != request.AdminParticipantId)
        {
            throw new CustomException("Changing AdminParticipantId is not allowed");
        }

        var previousSharedAmount = entity.SharedAmount;
        var previousAssignedDeadline = entity.AssignedDeadline;
        var assignmentChanged = entity.SharedAmount != request.SharedAmount || entity.AssignedDeadline != request.AssignedDeadline;

        _mapper.Map(request, entity);

        if (entity.SharedAmount < 0)
        {
            throw new CustomException("Shared amount cannot be negative");
        }

        if (entity.SharedAmount == 0)
        {
            entity.AssignedAt = null;
            entity.AssignedDeadline = null;
            entity.Rejected = false;
        }
        else if (assignmentChanged)
        {
            entity.AssignedAt = DateTime.UtcNow;
            entity.Rejected = false;
        }

        await _tripUserRepository.UpdateAsync(entity);

        if (assignmentChanged)
        {
            await NotifyExpenseAssignmentChangedAsync(entity, previousSharedAmount, previousAssignedDeadline);
        }
    }

    public async Task ToggleRejectSharedAssignmentAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = await _tripUserRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        if (entity == null)
        {
            throw new CustomException("Trip user not found or access denied");
        }

        if (entity.SharedAmount <= 0)
        {
            throw new CustomException("No shared amount assignment found for this participant");
        }

        var shouldNotifyRejected = !entity.Rejected;
        entity.Rejected = !entity.Rejected;
        await _tripUserRepository.UpdateAsync(entity);

        if (shouldNotifyRejected && entity.Rejected)
        {
            await NotifyAdminAboutRejectedExpenseAssignmentAsync(entity);
        }
    }

    public async Task<AutoAssignSharedExpensesResponse> AutoAssignSharedExpensesAsync(AutoAssignSharedExpensesRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var selectedIds = request.TripUserIds.Distinct().ToArray();
        if (selectedIds.Length == 0)
        {
            throw new CustomException("Select at least one participant");
        }

        var trip = await _tripRepository.GetByIdAsync(request.TripId);
        if (trip == null || trip.UserId != _currentUser.AdminId)
        {
            throw new CustomException("Trip not found");
        }

        var participants = await _tripUserRepository.GetByIdsForUpdateAsync(_currentUser.AdminId, request.TripId, selectedIds);

        if (participants.Count != selectedIds.Length)
        {
            throw new CustomException("One or more selected participants were not found");
        }

        var totalAmount = decimal.Round(
            (await _tripSharedExpenseRepository.GetAllFullAsync(request.TripId)).Sum(x => x.Amount),
            2,
            MidpointRounding.AwayFromZero);

        var alreadyAssignedAmount = decimal.Round(
            (await _tripUserRepository.GetAllAsync(_currentUser.AdminId, request.TripId)).Sum(x => x.SharedAmount),
            2,
            MidpointRounding.AwayFromZero);

        var amountToAssign = decimal.Round(totalAmount - alreadyAssignedAmount, 2, MidpointRounding.AwayFromZero);
        if (amountToAssign <= 0)
        {
            throw new CustomException("Nothing to assign");
        }

        var increments = SplitAmount(amountToAssign, participants.Count);
        var previousAmounts = participants.ToDictionary(x => x.Id, x => x.SharedAmount);
        var previousDeadlines = participants.ToDictionary(x => x.Id, x => x.AssignedDeadline);
        var assignedAt = DateTime.UtcNow;

        for (var index = 0; index < participants.Count; index++)
        {
            var participant = participants[index];
            participant.SharedAmount = decimal.Round(participant.SharedAmount + increments[index], 2, MidpointRounding.AwayFromZero);
            participant.AssignedAt = assignedAt;
            participant.Rejected = false;
        }

        await _tripUserRepository.SaveChangesAsync();

        foreach (var participant in participants)
        {
            await NotifyExpenseAssignmentChangedAsync(
                participant,
                previousAmounts[participant.Id],
                previousDeadlines[participant.Id]);
        }

        return new AutoAssignSharedExpensesResponse
        {
            TotalAmount = totalAmount,
            AlreadyAssignedAmount = alreadyAssignedAmount,
            AssignedAmount = amountToAssign,
            PerParticipantAmount = increments.Min(),
            ParticipantsCount = participants.Count,
        };
    }

    public async Task DeleteAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        await _tripUserRepository.DeleteAsync(id);
    }

    private async Task NotifyTripParticipantAddedAsync(Guid tripId, IReadOnlyCollection<Guid> adminParticipantIds)
    {
        if (adminParticipantIds.Count == 0)
        {
            return;
        }

        var trip = await _tripRepository.GetByIdAsync(tripId);
        if (trip == null || trip.UserId != _currentUser.AdminId)
        {
            return;
        }

        var baseUrlValue = await _settingsRepository.GetSettingByKey("plantour_app_origin");
        var baseUrl = baseUrlValue?.ToString()?.TrimEnd('/');

        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return;
        }

        var adminName = GetDisplayName(_currentUser.FirstName, _currentUser.LastName, _currentUser.Email);
        var participants = await _adminsParticipantRepository.FindFullBothActiveAsync(x =>
            x.AdminId == _currentUser.AdminId &&
            adminParticipantIds.Contains(x.Id));

        foreach (var participant in participants)
        {
            var recipientEmail = participant.Participant.Email;
            if (string.IsNullOrWhiteSpace(recipientEmail) || participant.Participant.Temporary)
            {
                continue;
            }

            try
            {
                var recipientName = GetDisplayName(
                    participant.Participant.FirstName,
                    participant.Participant.LastName,
                    recipientEmail);

                await _emailService.SendTripParticipantInvitationEmailAsync(new TripParticipantInvitationEmailRequest(
                    recipientEmail,
                    recipientName,
                    adminName,
                    trip.Name,
                    $"{baseUrl}/trips/{trip.Id}"));
            }
            catch (Exception)
            {
                _logger.LogWarning(
                    $"Failed to send trip participant invitation email for trip {tripId} and adminParticipant {participant.Id}");
            }
        }
    }

    private async Task NotifyExpenseAssignmentChangedAsync(TripUser entity, decimal previousSharedAmount, DateTime? previousAssignedDeadline)
    {
        var participant = entity.AdminParticipant?.Participant;
        if (participant == null
            || participant.Temporary
            || string.IsNullOrWhiteSpace(participant.Email)
            || string.IsNullOrWhiteSpace(entity.Trip?.Name))
        {
            return;
        }

        if (string.Equals(participant.Email, _currentUser.Email, StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        var baseUrl = await GetBaseUrlSafeAsync();
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return;
        }

        try
        {
            var recipientName = GetDisplayName(participant.FirstName, participant.LastName, participant.Email);
            var adminName = GetDisplayName(_currentUser.FirstName, _currentUser.LastName, _currentUser.Email);

            await _emailService.SendParticipantAssignmentChangesEmailAsync(new ParticipantAssignmentChangesEmailRequest(
                participant.Email,
                recipientName,
                adminName,
                entity.Trip.Name,
                "expense assignments",
                GetExpenseAssignmentActionLabel(previousSharedAmount, entity.SharedAmount),
                BuildExpenseAssignmentSummary(entity, previousSharedAmount, previousAssignedDeadline),
                entity.AssignedDeadline,
                $"{baseUrl}/trips/{entity.TripId}/trip-participants"));
        }
        catch (Exception)
        {
             _logger.LogWarning($"Failed to send expense assignment notification email for trip {entity.TripId} and trip user {entity.Id}");
        }
    }

    private async Task NotifyAdminAboutRejectedExpenseAssignmentAsync(TripUser entity)
    {
        var participant = entity.AdminParticipant?.Participant;
        if (participant == null || string.IsNullOrWhiteSpace(participant.Email) || string.IsNullOrWhiteSpace(entity.Trip?.Name))
        {
            return;
        }

        var admin = await _usersRepository.GetActiveByIdAsync(_currentUser.AdminId);
        if (admin == null || string.IsNullOrWhiteSpace(admin.Email))
        {
            return;
        }

        if (string.Equals(admin.Email, participant.Email, StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        var baseUrl = await GetBaseUrlSafeAsync();
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return;
        }

        try
        {
            var adminName = GetDisplayName(admin.FirstName, admin.LastName, admin.Email);
            var participantName = GetDisplayName(participant.FirstName, participant.LastName, participant.Email);
            var tripCurrencyName = GetTripCurrencyName(entity);

            await _emailService.SendAdminParticipantActionEmailAsync(new AdminParticipantActionEmailRequest(
                admin.Email,
                adminName,
                participantName,
                entity.Trip.Name,
                "expense assignment",
                $"shared amount {FormatSharedAmount(entity.SharedAmount, tripCurrencyName)}",
                "refused",
                $"{baseUrl}/trips/{entity.TripId}/trip-participants"));
        }
        catch (Exception)
        {
            _logger.LogWarning($"Failed to send admin expense rejection email for trip {entity.TripId} and trip user {entity.Id}");
        }
    }

    private async Task<string> GetBaseUrlSafeAsync()
    {
        var baseUrlValue = await _settingsRepository.GetSettingByKey("plantour_app_origin");
        return baseUrlValue?.ToString()?.TrimEnd('/') ?? string.Empty;
    }

    private static string GetExpenseAssignmentActionLabel(decimal previousSharedAmount, decimal currentSharedAmount)
    {
        if (previousSharedAmount <= 0 && currentSharedAmount > 0)
        {
            return "Assigned";
        }

        if (previousSharedAmount > 0 && currentSharedAmount <= 0)
        {
            return "Unassigned";
        }

        return "Updated";
    }

    private static IReadOnlyList<string> BuildExpenseAssignmentSummary(TripUser entity, decimal previousSharedAmount, DateTime? previousAssignedDeadline)
    {
        var items = new List<string>();
        var tripCurrencyName = GetTripCurrencyName(entity);

        if (entity.SharedAmount > 0)
        {
            items.Add($"Shared amount: {FormatSharedAmount(entity.SharedAmount, tripCurrencyName)}");
        }
        else
        {
            items.Add("Shared expense responsibility removed.");
        }

        if (previousSharedAmount > 0 && entity.SharedAmount > 0 && previousSharedAmount != entity.SharedAmount)
        {
            items.Add($"Previous amount: {FormatSharedAmount(previousSharedAmount, tripCurrencyName)}");
        }

        if (previousAssignedDeadline != entity.AssignedDeadline)
        {
            items.Add(entity.AssignedDeadline.HasValue
                ? $"Deadline updated to {entity.AssignedDeadline.Value:yyyy-MM-dd HH:mm} UTC"
                : "Deadline removed.");
        }

        return items;
    }

    private static string FormatSharedAmount(decimal value, string currencyName)
    {
        return $"{currencyName} {value.ToString("0.##", CultureInfo.InvariantCulture)}";
    }

    private static string GetTripCurrencyName(TripUser entity)
    {
        return string.IsNullOrWhiteSpace(entity.Trip?.Currency?.Name)
            ? "trip currency"
            : entity.Trip.Currency.Name;
    }

    private static string GetDisplayName(string? firstName, string? lastName, string email)
    {
        var fullName = Misc.GenerateFullName(firstName, lastName);
        return string.IsNullOrWhiteSpace(fullName) ? email : fullName;
    }

    private static decimal[] SplitAmount(decimal totalAmount, int participantsCount)
    {
        if (participantsCount <= 0)
        {
            return [];
        }

        var totalCents = (int)decimal.Round(totalAmount * 100m, 0, MidpointRounding.AwayFromZero);
        var baseCents = totalCents / participantsCount;
        var remainder = totalCents % participantsCount;
        var result = new decimal[participantsCount];

        for (var index = 0; index < participantsCount; index++)
        {
            var cents = baseCents + (index >= participantsCount - remainder ? 1 : 0);
            result[index] = cents / 100m;
        }

        return result;
    }

    private static TripUserDto PopulateTripUserStats(TripUserDto dto, TripUser entity)
    {
        dto.TotalPacks = entity.TripUserPackages?.Count ?? 0;
        dto.TotalThings = entity.TripUserThings?.Count ?? 0;
        dto.TotalTodos = entity.TripUserTodos?.Count ?? 0;
        dto.TotalSharedThings = entity.TripSharedThings?.Count ?? 0;
        dto.TotalSharedTodos = entity.TripSharedTodos?.Count ?? 0;

        var sharedPaidAmount = entity.TripUserExpenseTripUsers?
            .Where(x => x.Shared)
            .Sum(x => decimal.Round(x.Amount * (x.Rate ?? 1m), 2)) ?? 0m;

        dto.SharedPaidAmount = decimal.Round(sharedPaidAmount, 2);
        dto.SharedRemainingAmount = decimal.Round(Math.Max(dto.SharedAmount - dto.SharedPaidAmount, 0), 2);
        return dto;
    }
}
