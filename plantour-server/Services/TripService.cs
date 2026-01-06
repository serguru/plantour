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


    // public async Task<IEnumerable<TripDto>> GetAllAsync()
    // {
    //     _currentUser.RaiseIfNotAuthenticated();

    //     var entities = await _tripRepository.GetAllAsync();
    //     return _mapper.Map<IEnumerable<TripDto>>(entities);

    // }

    // public async Task<IEnumerable<TripDto>> GetAllForParticipantAsync()
    // {
    //     _currentUser.RaiseIfNotAuthenticated();

    //     var entities = await _tripRepository.GetAllFullAsync();

    //     entities = entities.Where(x =>
    //         x.UserId == _currentUser.AdminId &&
    //         x.TripUsers.Any(x =>
    //             x.AdminParticipant.AdminId == _currentUser.AdminId &&
    //             (
    //                 (_currentUser.IsParticipant && x.AdminParticipant.ParticipantId == _currentUser.UserId) || true
    //             )
    //         ));

    //     return _mapper.Map<IEnumerable<TripDto>>(entities);
    // }

    // public async Task<TripDto?> GetByIdAsync(Guid id)
    // {
    //     var entity = await _tripRepository.GetByIdAsync(id);
    //     return entity != null ? _mapper.Map<TripDto>(entity) : null;
    // }

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

    public async Task DeleteAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        await _tripRepository.DeleteAsync(id);
    }


    private TripDto StatsByTripDto(Trip entity)
    {
        var totalDays = (entity.EndDate.HasValue && entity.StartDate.HasValue) ? (entity.EndDate.Value.DayNumber - entity.StartDate.Value.DayNumber + 1) : 0;
        var totalParticipants = entity.TripUsers.Count;
        var totalPacks = entity.TripUsers.Sum(tu => tu.TripUserPackages.Count);
        var totalThings = entity.TripUsers.Sum(tu => tu.TripUserPackages.Sum(tp => tp.TripUserThings.Count));
        var adminIsParticipant = entity.TripUsers.Any(tu => tu.AdminParticipant.AdminId == tu.AdminParticipant.ParticipantId);

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
            TotalThings = totalThings,
            AdminIsParticipant = adminIsParticipant
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
            .Where(x => _currentUser.IsParticipant || x.AdminIsParticipant);

        return result;
    }

    
}

