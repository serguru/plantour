using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripCommentService(
    TripCommentRepository tripCommentRepository,
    TripUserRepository tripUserRepository,
    ICheckAccessService checkAccessService,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser) : ITripCommentService
{
    private readonly TripCommentRepository _tripCommentRepository = tripCommentRepository;
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;

    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;


    private TripCommentDto MapUserData(TripComment tripComment)
    {
        var dto = _mapper.Map<TripCommentDto>(tripComment);

        if (tripComment.TripUserId != null)
        {
            dto.UserId = _currentUser!.UserId;
            dto.FirstName = _currentUser!.FirstName;
            dto.LastName = _currentUser!.LastName;
            dto.Email = _currentUser!.Email;
        }
        else
        {
            dto.UserId = tripComment.TripUser!.AdminParticipant!.Admin!.Id;
            dto.FirstName = tripComment.TripUser!.AdminParticipant!.Admin!.FirstName;
            dto.LastName = tripComment.TripUser!.AdminParticipant!.Admin!.LastName;
            dto.Email = tripComment.TripUser!.AdminParticipant!.Admin!.Email;
            
        }
        return dto;
    }

    public async Task<IEnumerable<TripCommentDto>> GetAllAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entities = await _tripCommentRepository.GetAllAsync(_currentUser.AdminId, _currentUser.UserId, tripId);

        var dtos = entities.Select(MapUserData).OrderByDescending(x => x.PublishedAt);

        return dtos;
    }

    public async Task<TripCommentDto?> GetByIdAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var entity = await _tripCommentRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        return entity != null ? MapUserData(entity) : null;
    }

    public async Task<TripCommentDto> AddAsync(CreateTripCommentRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripUser = await _tripUserRepository.GetByTripIdAsync(
            _currentUser.AdminId,
            _currentUser.UserId,
            request.TripId);

        if (tripUser == null)
        {
            throw new CustomException("Trip user not found");
        }

        var entity = _mapper.Map<TripComment>(request);
        entity.Id = Guid.NewGuid();
        entity.TripUserId = tripUser.Id;
        entity.PublishedAt = DateTime.UtcNow;
        await _tripCommentRepository.AddAsync(entity);
        return _mapper.Map<TripCommentDto>(entity);
    }

    public async Task UpdateAsync(UpdateTripCommentRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(request.TripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripUser = await _tripUserRepository.GetByTripIdAsync(
            _currentUser.AdminId,
            _currentUser.UserId,
            request.TripId);

        if (tripUser == null)
        {
            throw new CustomException("Trip user not found");
        }


        var entity = await _tripCommentRepository.GetByIdAsync(_currentUser.AdminId, _currentUser.UserId, request.TripId, request.Id);
        if (entity == null)
        {
            throw new CustomException("User does not have access to this trip");
        }

        _mapper.Map(request, entity);
        
        await _tripCommentRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid tripId, Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var exists = await _tripCommentRepository.AnyByIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId, id);
        if (!exists)
        {
            throw new CustomException("Trip comment not found or access denied");
        }

        await _tripCommentRepository.DeleteAsync(id);
    }
}
