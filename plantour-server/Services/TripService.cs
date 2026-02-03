using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;
using System.Diagnostics.CodeAnalysis;
using System.Linq;

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
            CurrentUserIncluded = currentUserIncluded,
            DaysLeft = daysLeft,
            DaysLeftText = daysLeftText,
            TripStats = new PlantourStatsDto(),
            UserStats = new PlantourStatsDto()
        };

        AddStats(tripDto.TripStats, entity, false);
        AddStats(tripDto.UserStats, entity, true);

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


    private void AddStats(PlantourStatsDto stats, Trip entity, bool currentUserOnly)
    {
        stats.Days += (entity.EndDate.HasValue && entity.StartDate.HasValue) ? (entity.EndDate.Value.DayNumber - entity.StartDate.Value.DayNumber + 1) : 0;

        stats.Participants += entity.TripUsers.Count;

        var userId = _currentUser.UserId;

        entity.TripUsers.Where(x => !currentUserOnly || x.AdminParticipant.ParticipantId == userId).ToList().ForEach(x =>
        {
            stats.Packs += x.TripUserPackages.Count;
            stats.Things += x.TripUserThings.Count;

            foreach (var tripUserPackage in x.TripUserPackages)
            {
                if (!String.IsNullOrWhiteSpace(tripUserPackage.WeightUnit) && tripUserPackage.WeightValue.HasValue && tripUserPackage.WeightValue.Value > 0)
                {
                    Weight? existingWeight = stats.PackWeights!.FirstOrDefault(w => w.Unit.Equals(tripUserPackage.WeightUnit, StringComparison.OrdinalIgnoreCase));

                    if (existingWeight == null)
                    {
                        var newExistingWeight = new Weight { Unit = tripUserPackage.WeightUnit, Value = tripUserPackage.WeightValue.Value };
                        stats.PackWeights.Add(newExistingWeight);
                    } else
                    {
                        existingWeight.Value += tripUserPackage.WeightValue.Value;
                    }
                }
            }
        });

        if (currentUserOnly)
        {
            stats.SharedThings = entity.TripSharedThings.Count(x => x.AssignedTo?.AdminParticipant?.ParticipantId == userId);
            stats.SharedThingsDone = entity.TripSharedThings.Count(x => x.AssignedTo?.AdminParticipant?.ParticipantId == userId && x.AssignedThing?.Finished == "success");
            stats.SharedThingsOverdue = entity.TripSharedThings.Count(x => x.AssignedDeadline.HasValue &&
                x.AssignedDeadline.Value < DateTime.UtcNow && x.AssignedTo?.AdminParticipant?.ParticipantId == userId && x.AssignedThing?.Finished != "success"
                );
        }
        else
        {
            stats.SharedThings = entity.TripSharedThings.Count(x => x.AssignedToId != null);
            stats.SharedThingsDone = entity.TripSharedThings.Count(x => x.AssignedThing?.Finished == "success");
            stats.SharedThingsOverdue = entity.TripSharedThings.Count(x => x.AssignedDeadline.HasValue &&
                x.AssignedDeadline.Value < DateTime.UtcNow &&
                (
                    !x.AssignedToId.HasValue || x.AssignedThing?.Finished != "success"
                ));
        }

        var existingStatus = stats.TripStatuses.FirstOrDefault(x => x.Name.Equals(entity.TripStatus.Name, StringComparison.OrdinalIgnoreCase));

        if (existingStatus == null)
        {
            var newStatus = new Status { Name = entity.TripStatus.Name, Value = 1 };
            stats.TripStatuses.Add(newStatus);
        }
        else
        {
            existingStatus.Value += 1;
        }
    }

    public async Task<TripUserStatsDto> GetStats(Guid? tripId = null)
    {
        TripUserStatsDto result = new TripUserStatsDto();
        result.Trip = new PlantourStatsDto();
        result.Trip.PackWeights = new List<Weight>();
        result.Trip.TripStatuses = new List<Status>();

        result.User = new PlantourStatsDto();
        result.User.PackWeights = new List<Weight>();
        result.User.TripStatuses = new List<Status>();

        List<Trip> trips;

        if (tripId is Guid id && id != Guid.Empty)
        {
            var singleTrip = await _tripRepository.GetByIdFullAsync(_currentUser, id);
            trips = (singleTrip != null ? new[] { singleTrip } : Enumerable.Empty<Trip>()).ToList();
        }
        else
        {
            trips = (await _tripRepository.GetAllFullAsync(_currentUser)).ToList();
        }

        var userId = _currentUser.UserId;

        trips.ForEach(x =>
        {
            AddStats(result.User, x, true);
            AddStats(result.Trip, x, false);
        });

        return result;
    }

    public async Task<TripDto?> GetDashboardTripWithStatsAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();
        var trips = await _tripRepository.GetAllAsync();

        var tripEntity = trips.MaxBy(t => t.CreatedAt);

        if (tripEntity == null)
        {
            return null;
        }

        var entity = await _tripRepository.GetByIdFullAsync(_currentUser, tripEntity.Id);
        if (entity == null)
        {
            return null;
        }

        TripDto tripDto = StatsByTripDto(entity);
        return tripDto;
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

