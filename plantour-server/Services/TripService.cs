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

    private void AddStatsToTripDto(TripDto tripDto, Trip trip)
    {
        tripDto.CurrentUserIncluded = trip.TripUsers.Any(tu => tu.AdminParticipant.AdminId == _currentUser.AdminId && tu.AdminParticipant.ParticipantId == _currentUser.UserId);
        tripDto.TotalPacks = trip.TripUsers.SelectMany(tu => tu.TripUserPackages).Count();
        tripDto.TotalParticipants = trip.TripUsers.Count;
        tripDto.TotalSharedThings = trip.TripUsers.SelectMany(tu => tu.TripSharedThings).Count();
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


}

