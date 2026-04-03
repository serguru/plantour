using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using plantour_server.Utils;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripUserService(
    TripUserRepository tripUserRepository,
    ICheckAccessService checkAccessService,
    DicTripRepository dicTripRepository,
    AdminsParticipantRepository adminsParticipantRepository,
    TripRepository tripRepository,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser,
    IEmailService emailService,
    SettingsRepository settingsRepository,
    ILogger<TripUserService> logger) : ITripUserService
{
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
    private readonly IMapper _mapper = mapper;
    private readonly DicTripRepository _dicTripRepository = dicTripRepository;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly AdminsParticipantRepository _adminsParticipantRepository = adminsParticipantRepository;
    private readonly TripRepository _tripRepository = tripRepository;
    private readonly IEmailService _emailService = emailService;
    private readonly SettingsRepository _settingsRepository = settingsRepository;
    private readonly ILogger<TripUserService> _logger = logger;

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
        entity.Accept = null;
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

        var entity = await _tripUserRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, request.TripId, request.Id);
        if (entity == null)
        {
            throw new CustomException("Trip User does not exist for this trip");
        }

        if (entity.AdminParticipantId != request.AdminParticipantId)
        {
            throw new CustomException("Changing AdminParticipantId is not allowed");
        }

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
            entity.Accept = null;
        }
        else if (assignmentChanged)
        {
            entity.AssignedAt = DateTime.UtcNow;
            entity.Accept = null;
        }

        await _tripUserRepository.UpdateAsync(entity);
    }

    public async Task ToggleAcceptSharedAssignmentAsync(Guid tripId, Guid id)
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

        entity.Accept = entity.Accept == "accepted" ? null : "accepted";
        await _tripUserRepository.UpdateAsync(entity);
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

        entity.Accept = entity.Accept == "rejected" ? null : "rejected";
        await _tripUserRepository.UpdateAsync(entity);
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
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "Failed to send trip participant invitation email for trip {TripId} and adminParticipant {AdminParticipantId}",
                    tripId,
                    participant.Id);
            }
        }
    }

    private static string GetDisplayName(string? firstName, string? lastName, string email)
    {
        var fullName = Misc.GenerateFullName(firstName, lastName);
        return string.IsNullOrWhiteSpace(fullName) ? email : fullName;
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
