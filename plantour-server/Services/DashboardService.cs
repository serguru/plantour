using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using plantour_server.Utils;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class DashboardService(
    ICheckAccessService checkAccessService,
    TripRepository tripRepository,
    HttpCurrentUser httpCurrentUser) : IDashboardService
{
    private readonly TripRepository _tripRepository = tripRepository;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;

    public async Task<DashboardTripDto?> GetDashboardTripDtoAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new UnauthorizedAccessException("User does not have access to this trip");
        }

        var trip = await _tripRepository.GetByIdFullAsync(_currentUser, tripId);

        if (trip == null)
        {
            return null;
        }


        int daysLeft = 0;
        string daysLeftText = "";
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (trip.StartDate >= today)
        {
            daysLeft = trip.StartDate.DayNumber - today.DayNumber + 1;
            daysLeftText = daysLeft switch
            {
                > 1 => $"{daysLeft} days left to start",
                1 => "1 day left to start",
                0 => "Start today!",
                _ => ""
            };
        }
        else if (trip.EndDate >= today)
        {
            daysLeft = trip.EndDate.DayNumber - today.DayNumber + 1;
            daysLeftText = daysLeft switch
            {
                > 1 => $"{daysLeft} days left to end",
                1 => "1 day left to end",
                0 => "End today!",
            _ => ""
            };
        }

        var dto = new DashboardTripDto
        {
            Id = trip.Id,
            TripStatus = trip.TripStatus.Name,
            Name = trip.Name,
            Notes = trip.Notes,
            FromTo = DateUtils.TwoDatesToStr(trip.StartDate, trip.EndDate),
            CurrentUserIncluded = trip.TripUsers.Any(tu => tu.AdminParticipant.AdminId == _currentUser.AdminId && tu.AdminParticipant.ParticipantId == _currentUser.UserId),
            DaysLeft = daysLeft,
            DaysLeftText = daysLeftText
        };

        return dto;
    }

    public async Task<DashboardUserTripDto?> GetDashboardUserTripDtoAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new UnauthorizedAccessException("User does not have access to this trip");
        }

        var trip = await _tripRepository.GetByIdFullAsync(_currentUser, tripId);

        if (trip == null)
        {
            return null;
        }

        var userId = _currentUser.UserId;


        var dto = new DashboardUserTripDto
        {
            Id = trip.Id,
        };

        var tripUser = trip.TripUsers.FirstOrDefault(x => x.AdminParticipant.ParticipantId == userId);
        if (tripUser != null)
        {
            dto.Packs = tripUser.TripUserPackages.Count;
            dto.Items = tripUser.TripUserThings.Count;
            dto.Todos = tripUser.TripUserTodos.Count;
            dto.SharedTotal = trip.TripSharedThings.Count();
            dto.SharedAssigned = trip.TripSharedThings.Count(x => x.AssignedToId == tripUser!.Id);
            dto.SharedPending = trip.TripSharedThings.Count(x => x.AssignedToId == tripUser!.Id && x.AssignedThing?.Finished == null);
            dto.SharedOverdue = trip.TripSharedThings.Count(x => x.AssignedToId == tripUser!.Id && x.AssignedThing?.Finished != "success" && x.AssignedDeadline != null && x.AssignedDeadline < DateTime.UtcNow);
            dto.SharedSuccess = trip.TripSharedThings.Count(x => x.AssignedToId == tripUser!.Id && x.AssignedThing?.Finished == "success");
            dto.SharedFailure = trip.TripSharedThings.Count(x => x.AssignedToId == tripUser!.Id && x.AssignedThing?.Finished == "failure");
            dto.SharedTodosTotal = trip.TripSharedTodos.Count();
            dto.SharedTodosAssigned = trip.TripSharedTodos.Count(x => x.AssignedToId == tripUser!.Id);
            dto.SharedTodosPending = trip.TripSharedTodos.Count(x => x.AssignedToId == tripUser!.Id && x.AssignedTodo?.Finished == null);
            dto.SharedTodosOverdue = trip.TripSharedTodos.Count(x => x.AssignedToId == tripUser!.Id && x.AssignedTodo?.Finished != "success" && x.AssignedDeadline != null && x.AssignedDeadline < DateTime.UtcNow);
            dto.SharedTodosSuccess = trip.TripSharedTodos.Count(x => x.AssignedToId == tripUser!.Id && x.AssignedTodo?.Finished == "success");
            dto.SharedTodosFailure = trip.TripSharedTodos.Count(x => x.AssignedToId == tripUser!.Id && x.AssignedTodo?.Finished == "failure");

            List<Weight> packWeights = new List<Weight>();


            foreach (var tripUserPackage in tripUser.TripUserPackages)
            {
                if (!String.IsNullOrWhiteSpace(tripUserPackage.WeightUnit) && tripUserPackage.WeightValue.HasValue && tripUserPackage.WeightValue.Value > 0)
                {
                    Weight? existingWeight = packWeights!.FirstOrDefault(w => w.Unit.Equals(tripUserPackage.
                    WeightUnit, StringComparison.OrdinalIgnoreCase));

                    if (existingWeight == null)
                    {
                        var newExistingWeight = new Weight { Unit = tripUserPackage.WeightUnit, Value = tripUserPackage.WeightValue.Value };
                        packWeights.Add(newExistingWeight);
                    }
                    else
                    {
                        existingWeight.Value += tripUserPackage.WeightValue.Value;
                    }
                }
            }

            if (tripUser.NopackWeightUnit != null && tripUser.NopackWeightValue.HasValue && tripUser.NopackWeightValue.Value > 0)
            {
                Weight? existingWeight = packWeights!.FirstOrDefault(w => w.Unit.Equals(tripUser.NopackWeightUnit, StringComparison.OrdinalIgnoreCase));

                if (existingWeight == null)
                {
                    var newExistingWeight = new Weight { Unit = tripUser.NopackWeightUnit, Value = tripUser.NopackWeightValue.Value };
                    packWeights.Add(newExistingWeight);
                }
                else
                {
                    existingWeight.Value += tripUser.NopackWeightValue.Value;
                }
            }

            if (packWeights.Count > 0)
            {
                dto.WeightStr = string.Join(", ", packWeights.Select(w => $"{w.Value} {w.Unit}"));
            }
        }

        return dto;
    }

    public async Task<DashboardAllUsersTripDto?> GetDashboardAllUsersTripDtoAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new UnauthorizedAccessException("User does not have access to this trip");
        }

        var trip = await _tripRepository.GetByIdFullAsync(_currentUser, tripId);

        if (trip == null)
        {
            return null;
        }

        var userId = _currentUser.UserId;


        var dto = new DashboardAllUsersTripDto
        {
            Id = trip.Id,
        };

        dto.Participants = trip.TripUsers.Count;

        dto.Packs = trip.TripUsers.SelectMany(tu => tu.TripUserPackages).Count();

        dto.SharedTotal = trip.TripSharedThings.Count();
        dto.SharedAssigned = trip.TripSharedThings.Count(x => x.AssignedToId != null);

        dto.SharedPending = trip.TripSharedThings.Count(x => x.AssignedToId != null && x.AssignedThing?.Finished == null);

        dto.SharedOverdue = trip.TripSharedThings.Count(x => x.AssignedToId != null && x.AssignedThing?.Finished != "success" && x.AssignedDeadline != null && x.AssignedDeadline < DateTime.UtcNow);

        dto.SharedSuccess = trip.TripSharedThings.Count(x => x.AssignedToId != null && x.AssignedThing?.Finished == "success");

        dto.SharedFailure = trip.TripSharedThings.Count(x => x.AssignedToId != null && x.AssignedThing?.Finished == "failure");

        dto.SharedTodosTotal = trip.TripSharedTodos.Count();
        dto.SharedTodosAssigned = trip.TripSharedTodos.Count(x => x.AssignedToId != null);
        dto.SharedTodosPending = trip.TripSharedTodos.Count(x => x.AssignedToId != null && x.AssignedTodo?.Finished == null);
        dto.SharedTodosOverdue = trip.TripSharedTodos.Count(x => x.AssignedToId != null && x.AssignedTodo?.Finished != "success" && x.AssignedDeadline != null && x.AssignedDeadline < DateTime.UtcNow);
        dto.SharedTodosSuccess = trip.TripSharedTodos.Count(x => x.AssignedToId != null && x.AssignedTodo?.Finished == "success");
        dto.SharedTodosFailure = trip.TripSharedTodos.Count(x => x.AssignedToId != null && x.AssignedTodo?.Finished == "failure");

        List<Weight> packWeights = new List<Weight>();


        foreach (var tripUserPackage in trip.TripUsers.SelectMany(tu => tu.TripUserPackages))
        {
            if (!String.IsNullOrWhiteSpace(tripUserPackage.WeightUnit) && tripUserPackage.WeightValue.HasValue && tripUserPackage.WeightValue.Value > 0)
            {
                Weight? existingWeight = packWeights!.FirstOrDefault(w => w.Unit.Equals(tripUserPackage.
                WeightUnit, StringComparison.OrdinalIgnoreCase));

                if (existingWeight == null)
                {
                    var newExistingWeight = new Weight { Unit = tripUserPackage.WeightUnit, Value = tripUserPackage.WeightValue.Value };
                    packWeights.Add(newExistingWeight);
                }
                else
                {
                    existingWeight.Value += tripUserPackage.WeightValue.Value;
                }
            }
        }



        foreach (var tripUser in trip.TripUsers)
        {
            if (!String.IsNullOrWhiteSpace(tripUser.NopackWeightUnit) && tripUser.NopackWeightValue.HasValue && tripUser.NopackWeightValue.Value > 0)
            {
                Weight? existingWeight = packWeights!.FirstOrDefault(w => w.Unit.Equals(tripUser.NopackWeightUnit, StringComparison.OrdinalIgnoreCase));

                if (existingWeight == null)
                {
                    var newExistingWeight = new Weight { Unit = tripUser.NopackWeightUnit, Value = tripUser.NopackWeightValue.Value };
                    packWeights.Add(newExistingWeight);
                }
                else
                {
                    existingWeight.Value += tripUser.NopackWeightValue.Value;
                }
            }
        }


        if (packWeights.Count > 0)
        {
            dto.WeightStr = string.Join(", ", packWeights.Select(w => $"{w.Value} {w.Unit}"));
        }


        var participants = trip.TripUsers.Count;
        var finishedPacking = trip.TripUsers.Count(tu => tu.PackagingComplete);

        var sharedThings = trip.TripSharedThings.Count;;
        var sharedFinishedPacking = trip.TripSharedThings.Count(st => st.AssignedThing != null && st.AssignedThing.Finished == "success");


        // 100% 
        int h = participants + 1; 

        // % per one member
        float p = 100f / h;

        // packing progress from participants
        float pp = finishedPacking * p;

        // packing progress from shared things
        float sp = sharedFinishedPacking * (p / sharedThings);

        dto.PackingProgress = (int)(pp + sp);

        return dto;
    }



}
