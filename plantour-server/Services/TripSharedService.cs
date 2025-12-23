using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripSharedService(
    TripSharedRepository tripSharedRepository,
    ICheckAccessService checkAccessService,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser
    ) : ITripSharedService
{
    private readonly TripSharedRepository _tripSharedRepository = tripSharedRepository;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;


    public async Task<IEnumerable<TripSharedDto>> GetAllFullAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new UnauthorizedAccessException("User does not have access to this trip");
        }


        var items = await _tripSharedRepository.GetAllFullAsync(tripId);
        return items.Select(item => _mapper.Map<TripSharedDto>(item));
    }

    public async Task<TripThingDto?> GetByIdAsync(Guid tripId, Guid id)
    {
        return null;
    }
    public async Task<TripThingDto> AddAsync(CreateTripSharedRequest request)
    {
        return new TripThingDto();
    }
    public async Task<bool> UpdateAsync(UpdateTripSharedRequest request)
    {
        return true;
    }
    public async Task<bool> DeleteAsync(Guid tripId, Guid id)
    {
        return true;
    }
    public async Task<int> InsertTripSharedsAsync(Guid tripId, Guid[] packageIds)
    {
        return 0;
    }
    public async Task<int> DeleteTripSharedsAsync(Guid tripId, Guid[] packageIds)
    {
        return 0;
    }




}