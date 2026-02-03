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

    public async Task<DashboardTripDto?> GetDashboardTripDtoAsync(Guid? tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (tripId != null && !await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId.Value))
        {
            throw new UnauthorizedAccessException("User does not have access to this trip");
        }

        var trip = await _tripRepository.GetByIdOrLatestFullAsync(_currentUser, tripId);

        if (trip == null)
        {
            return null;
        }


        int daysLeft = 0;
        string daysLeftText = "";
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (trip.StartDate.HasValue && trip.StartDate.Value >= today)
        {
            daysLeft = trip.StartDate.Value.DayNumber - today.DayNumber;
            daysLeftText = daysLeft switch
            {
                > 1 => $"{daysLeft} days left to start",
                1 => "1 day left to start",
                0 => "Start today!",
                _ => ""
            };
        }
        else if (trip.EndDate.HasValue && trip.EndDate.Value >= today)
        {
            daysLeft = trip.EndDate.Value.DayNumber - today.DayNumber;
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

}
