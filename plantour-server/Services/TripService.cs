using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripService(
    TripRepository tripRepository,
    ICheckAccessService checkAccessService,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser) : ITripService
{
    private readonly TripRepository _tripRepository = tripRepository;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    public async Task<TripDto> AddAsync(CreateTripRequest request)
    {
        _currentUser.RaiseIfNotAdmin();
        if (_tripRepository.AnyAsync(x => x.Name.ToLower() == request.Name.ToLower() && x.UserId == _currentUser.UserId).Result)
        {
            throw new CustomException("A trip with the same name already exists for this user");
        }
        var entity = _mapper.Map<Trip>(request);
        entity.Id = Guid.NewGuid();
        entity.UserId = _currentUser.AdminId;
        await _tripRepository.AddAsync(entity);

        TripDto tripDto = _mapper.Map<TripDto>(entity);

        return tripDto;
    }

    public async Task UpdateAsync(UpdateTripRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        if (await _tripRepository.AnyAsync(x => x.Name.ToLower() == request.Name.ToLower() && x.UserId == _currentUser.UserId && x.Id != request.Id))
        {
            throw new CustomException("A trip with the same name already exists for this user");
        }

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.Id))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = await _tripRepository.GetByIdAsync(request.Id);
        _mapper.Map(request, entity);
        await _tripRepository.UpdateAsync(entity!);
    }

    public async Task DeleteAsync(Guid id)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(id))
        {
            throw new CustomException("User does not have access to this trip");
        }

        await _tripRepository.DeleteAsync(id);
    }


    private TripDto StatsByTripDto(Trip entity)
    {

        var userId = _currentUser.UserId;

        var totalDays = (entity.EndDate.HasValue && entity.StartDate.HasValue) ? (entity.EndDate.Value.DayNumber - entity.StartDate.Value.DayNumber + 1) : 0;
        var totalParticipants = entity.TripUsers.Count;
        var totalPacks = entity.TripUsers.Sum(tu => tu.TripUserPackages.Count);
        var userTotalPacks = entity.TripUsers.Sum(tu => tu.TripUserPackages.Count(x => x.TripUser.AdminParticipant.Participant.Id == userId));

        var totalSharedThings = entity.TripSharedThings.Count;
        var userTotalSharedThings = entity.TripSharedThings.Count(x => x.AssignedToId.HasValue && x.AssignedTo!.AdminParticipant.Participant.Id == userId);

        var currentUserIncluded = entity.TripUsers.Any(x => x.AdminParticipant.ParticipantId == userId);
        int daysLeft = 0;
        string daysLeftText = "";
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (entity.StartDate.HasValue && entity.StartDate.Value >= today)
        {
            daysLeft = entity.StartDate.Value.DayNumber - today.DayNumber;
            daysLeftText = daysLeft switch
            {
                > 1 => $"{daysLeft} days left to start",
                1 => "1 day left to start",
                0 => "Start today!",
                _ => ""
            };
        }
        else if (entity.EndDate.HasValue && entity.EndDate.Value >= today)
        {
            daysLeft = entity.EndDate.Value.DayNumber - today.DayNumber;
            daysLeftText = daysLeft switch
            {
                > 1 => $"{daysLeft} days left to end",
                1 => "1 day left to end",
                0 => "End today!",
                _ => ""
            };
        }

        var totalSharedThingsDone = entity.TripSharedThings.Count(x => x.AssignedThing?.Finished == "success");

        var userTotalSharedThingsDone = entity.TripSharedThings.Count(x =>
            x.AssignedToId.HasValue &&
            x.AssignedTo!.AdminParticipant.Participant.Id == userId &&
            x.AssignedThing?.Finished == "success"
        );

        var totalSharedThingsOverdue = entity.TripSharedThings.Count(x =>
            x.AssignedDeadline.HasValue &&
            x.AssignedDeadline.Value < DateTime.UtcNow &&
            (
                !x.AssignedToId.HasValue ||
                (
                    x.AssignedToId.HasValue &&
                    !(x.AssignedThing != null && x.AssignedThing.Finished == "success")
                )
            )
        );

        var userTotalSharedThingsOverdue = entity.TripSharedThings.Count(x =>
            x.AssignedDeadline.HasValue &&
            x.AssignedDeadline.Value < DateTime.UtcNow &&
            (
                !x.AssignedToId.HasValue ||
                (
                    x.AssignedToId.HasValue &&
                    x.AssignedTo!.AdminParticipant.Participant.Id == userId &&
                    !(x.AssignedThing != null && x.AssignedThing.Finished == "success")
                )
            )
        );

        string totalPackWeightsStr = "";
        List<WeightDto> totalWeights = new List<WeightDto>();
        foreach (var tripUser in entity.TripUsers)
        {
            foreach (var tripUserPackage in tripUser.TripUserPackages)
            {
                if (!String.IsNullOrWhiteSpace(tripUserPackage.WeightUnit) && tripUserPackage.WeightValue.HasValue && tripUserPackage.WeightValue.Value > 0)
                {
                    var existingWeight = totalWeights.FirstOrDefault(w => w.Unit == tripUserPackage.WeightUnit);
                    if (existingWeight != null)
                    {
                        existingWeight.Value += tripUserPackage.WeightValue.Value;
                    }
                    else
                    {
                        totalWeights.Add(new WeightDto
                        {
                            Unit = tripUserPackage.WeightUnit,
                            Value = tripUserPackage.WeightValue.Value
                        });
                    }
                }
            }
        }
        totalPackWeightsStr = string.Join(", ", totalWeights.Select(w => $"{w.Value} {w.Unit}"));

        string userTotalPackWeightsStr = "";
        List<WeightDto> totalWeightsU = new List<WeightDto>();
        foreach (var tripUser in entity.TripUsers)
        {
            foreach (var tripUserPackage in tripUser.TripUserPackages.Where(x => x.TripUser.AdminParticipant.Participant.Id == userId))
            {
                if (!String.IsNullOrWhiteSpace(tripUserPackage.WeightUnit) && tripUserPackage.WeightValue.HasValue && tripUserPackage.WeightValue.Value > 0)
                {
                    var existingWeight = totalWeightsU.FirstOrDefault(w => w.Unit == tripUserPackage.WeightUnit);
                    if (existingWeight != null)
                    {
                        existingWeight.Value += tripUserPackage.WeightValue.Value;
                    }
                    else
                    {
                        totalWeightsU.Add(new WeightDto
                        {
                            Unit = tripUserPackage.WeightUnit,
                            Value = tripUserPackage.WeightValue.Value
                        });
                    }
                }
            }
        }
        userTotalPackWeightsStr = string.Join(", ", totalWeightsU.Select(w => $"{w.Value} {w.Unit}"));

        TripDto tripDto = new TripDto
        {
            Id = entity.Id,
            UserId = entity.UserId,
            TripStatusId = entity.TripStatusId,
            TripStatus = entity.TripStatus.Name,
            Name = entity.Name,
            Notes = entity.Notes,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            TotalDays = totalDays,
            TotalParticipants = totalParticipants,
            TotalPacks = totalPacks,
            TotalSharedThings = totalSharedThings,
            CurrentUserIncluded = currentUserIncluded,
            DaysLeft = daysLeft,
            DaysLeftText = daysLeftText,
            TotalSharedThingsDone = totalSharedThingsDone,
            TotalSharedThingsOverdue = totalSharedThingsOverdue,
            TotalPackWeightsStr = totalPackWeightsStr,
            UserTotalPacks = userTotalPacks,
            UserTotalSharedThings = userTotalSharedThings,
            UserTotalSharedThingsDone = userTotalSharedThingsDone,
            UserTotalSharedThingsOverdue = userTotalSharedThingsOverdue,
            UserTotalPackWeightsStr = userTotalPackWeightsStr
        };
        return tripDto;
    }

    public async Task<TripDto?> GetByIdWithStatsAsync(Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(id))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = await _tripRepository.GetByIdFullAsync(_currentUser, id);

        if (entity == null)
        {
            return null;
        }

        TripDto? result = StatsByTripDto(entity);
        return result;
    }

    public async Task<IEnumerable<TripDto>> GetAllWithStatsAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();

        var entities = await _tripRepository.GetAllFullAsync(_currentUser);

        var result = entities
            .Select(x => StatsByTripDto(x));

        return result;
    }

    public async Task<IEnumerable<TripDto>> GetAllWithStatsWhereParticipantAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();

        var entities = await _tripRepository.GetAllFullAsync(_currentUser);

        var result = entities
            .Select(x => StatsByTripDto(x))
            .Where(x => x.CurrentUserIncluded);

        return result;
    }


}

