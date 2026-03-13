using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripUserService(
    TripUserRepository tripUserRepository,
    ICheckAccessService checkAccessService,
    DicTripRepository dicTripRepository,
    AdminsParticipantRepository adminsParticipantRepository,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser) : ITripUserService
{
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
    private readonly IMapper _mapper = mapper;
    private readonly DicTripRepository _dicTripRepository = dicTripRepository;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly AdminsParticipantRepository _adminsParticipantRepository = adminsParticipantRepository;

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

        var s2 = _currentUser.IsAdmin ? "Please пo to your profile page and upgrade your plan to remove this limit." : "Please ask your administrator to upgrade the plan to remove this limit.";


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
        return await _dicTripRepository.InsertTripUsersAsync(_currentUser.AdminId, tripId, ids);
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

        dtos = dtos.Select((dto, index) =>
        {
            dto.TotalPacks = entities.ElementAt(index).TripUserPackages?.Count ?? 0;
            dto.TotalThings = entities.ElementAt(index).TripUserThings?.Count ?? 0;
            dto.TotalTodos = entities.ElementAt(index).TripUserTodos?.Count ?? 0;
            dto.TotalSharedThings = entities.ElementAt(index).TripSharedThings?.Count ?? 0;
            dto.TotalSharedTodos = entities.ElementAt(index).TripSharedTodos?.Count ?? 0;
            return dto;
        });

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

        TripUserDto dto = _mapper.Map<TripUserDto>(entity);
        dto.TotalPacks = entity.TripUserPackages?.Count ?? 0;
        dto.TotalThings = entity.TripUserThings?.Count ?? 0;
        dto.TotalTodos = entity.TripUserTodos?.Count ?? 0;
        dto.TotalSharedThings = entity.TripSharedThings?.Count ?? 0;
        dto.TotalSharedTodos = entity.TripSharedTodos?.Count ?? 0;
        return dto;
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

        TripUserDto dto = _mapper.Map<TripUserDto>(entity);
        dto.TotalPacks = entity.TripUserPackages?.Count ?? 0;
        dto.TotalThings = entity.TripUserThings?.Count ?? 0;
        dto.TotalTodos = entity.TripUserTodos?.Count ?? 0;
        dto.TotalSharedThings = entity.TripSharedThings?.Count ?? 0;
        dto.TotalSharedTodos = entity.TripSharedTodos?.Count ?? 0;
        return dto;
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
        await _tripUserRepository.AddAsync(entity);
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

        _mapper.Map(request, entity);
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
}
