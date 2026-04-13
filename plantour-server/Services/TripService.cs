using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.Services;

public class TripService(
    ILogger<TripService> logger,
    TripRepository tripRepository,
    AdminsParticipantRepository adminsParticipantRepository,
    IAdminsParticipantService adminsParticipantService,
    ICheckAccessService checkAccessService,
    UsersRepository usersRepository,
    TripUserRepository tripUserRepository,
    IMapper mapper,
    UserSettingsRepository userSettingsRepository,
    HttpCurrentUser httpCurrentUser) : ITripService
{
    private readonly ILogger<TripService> _logger = logger;
    private readonly TripRepository _tripRepository = tripRepository;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly AdminsParticipantRepository _adminsParticipantRepository = adminsParticipantRepository;
    private readonly IAdminsParticipantService _adminsParticipantService = adminsParticipantService;

    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
    private readonly UsersRepository _usersRepository = usersRepository;

    private readonly UserSettingsRepository _userSettingsRepository = userSettingsRepository;



    public async Task<TripDto> AddAsync(CreateTripRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        var activeAdminExists = await _usersRepository.ActiveUserExistsByIdAsync(_currentUser.UserId);
        if (!activeAdminExists)
        {
            throw new CustomException("Cannot create a trip for not active user");
        }

        var adminParticipants = await _adminsParticipantRepository.FindFullAsync(x => x.AdminId == _currentUser.UserId && x.ParticipantId == _currentUser.UserId);
        var adminParticipant = adminParticipants?.FirstOrDefault();

        if (adminParticipant == null)
        {

            Tuple<string, string> accessCodeResult = await _adminsParticipantService.GenerateAccessCodeAsync();

            adminParticipant = new()
            {
                Id = Guid.NewGuid(),
                AdminId = _currentUser.UserId,
                ParticipantId = _currentUser.UserId,
                Notes = "A participant created automatically and who is an admin",
                AccessCodeHash = accessCodeResult.Item2
            };

            await _adminsParticipantRepository.AddAsync(adminParticipant);

            var admin = await _usersRepository.GetActiveByIdAsync(_currentUser.UserId);
            admin!.ParticipantCode = accessCodeResult.Item1;
            await _usersRepository.UpdateAsync(admin);
        }

        if (await _tripRepository.AnyAsync(x => x.Name.ToLower() == request.Name.ToLower() && x.UserId == _currentUser.UserId))
        {
            throw new CustomException("A trip with the same name already exists for this user");
        }

        var trip = _mapper.Map<Trip>(request);
        trip.Id = Guid.NewGuid();
        trip.UserId = _currentUser.UserId;
        try
        {
            await _tripRepository.AddAsync(trip);
        }
        catch (DbUpdateException ex) when (IsTripDatesOverlapError(ex))
        {
            throw new CustomException("Trip dates overlap with another trip for this user", "TRIP_DATES_OVERLAP");
        }
        TripDto tripDto = _mapper.Map<TripDto>(trip);

        TripUser tripUser = new()
        {
            Id = Guid.NewGuid(),
            TripId = trip.Id,
            AdminParticipantId = adminParticipant.Id,
            Notes = "A trip participant created automatically and who is an admin"
        };

        await _tripUserRepository.AddAsync(tripUser);

        StartEndDates? dates = await _userSettingsRepository.GetUserEntitiesLogging(_currentUser.AdminId);

        DateTime now = DateTime.UtcNow;
        if (dates != null && dates.Start <= now && now <= dates.End)
        {
            // TODO LOG
            // _logger.LogInformation("User added a new trip id = {tripId}, name = {name}, event_type: {event_type}, subtype: {subtype}", trip.Id, trip.Name, "user_log_entities", "trip_added");
        }
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

        StartEndDates? dates = await _userSettingsRepository.GetUserEntitiesLogging(_currentUser.AdminId);

        DateTime now = DateTime.UtcNow;
        var logNeeded = dates != null && dates.Start <= now && now <= dates.End;
        Trip? trip = null;
        if (logNeeded)
        {
            trip = await _tripRepository.GetByIdAsync(id) ?? throw new CustomException("Trip not found");
        }

        await _tripRepository.DeleteAsync(id);

        if (logNeeded)
        {
            // TODO LOG
            // _logger.LogInformation("User deleted a trip id = {tripId}, name = {name}, event_type: {event_type}, subtype: {subtype}", trip!.Id, trip.Name, "user_log_entities", "trip_deleted");
        }
    }

    private void AddStatsToTripDto(TripDto tripDto, Trip trip)
    {
        tripDto.CurrentUserIncluded = trip.TripUsers.Any(tu => tu.AdminParticipant.AdminId == _currentUser.AdminId && tu.AdminParticipant.ParticipantId == _currentUser.UserId);
        tripDto.TotalPacks = trip.TripUsers.SelectMany(tu => tu.TripUserPackages).Count();
        tripDto.TotalParticipants = trip.TripUsers.Count;
        tripDto.TotalSharedThings = trip.TripUsers.SelectMany(tu => tu.TripSharedThings).Count();
        tripDto.TotalSharedTodos = trip.TripSharedTodos.Count;
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

        TripDto? result = _mapper.Map<TripDto>(entity);
        AddStatsToTripDto(result, entity);
        return result;
    }


    public async Task<IEnumerable<TripDto>> GetAllWithStatsAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();

        var entities = await _tripRepository.GetAllFullAsync(_currentUser);

        var result = entities.Select(x =>
        {
            var dto = _mapper.Map<TripDto>(x);
            AddStatsToTripDto(dto, x);
            return dto;
        });

        return result;
    }

    public async Task<IEnumerable<TripDto>> GetAllWithStatsWhereParticipantAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();

        var entities = await _tripRepository.GetAllFullAsync(_currentUser);

        var result = entities
            .Select(x =>
            {
                var dto = _mapper.Map<TripDto>(x);
                AddStatsToTripDto(dto, x);
                return dto;
            })
            .Where(x => x.CurrentUserIncluded);

        return result;
    }


    private static bool IsTripDatesOverlapError(DbUpdateException ex)
    {
        var message = ex.GetBaseException().Message;
        return message.Contains("Trip dates overlap with another trip for this user", StringComparison.OrdinalIgnoreCase);
    }
}

