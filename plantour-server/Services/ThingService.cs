using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class ThingService(
    ThingRepository ThingRepository,
    ThingCategoryRepository thingCategoryRepository,
    IMapper mapper,
    ICheckAccessService checkAccessService,
    TripThingRepository tripThingRepository,
    TripSharedRepository tripSharedRepository,
    DicTripRepository dicTripRepository,
    HttpCurrentUser httpCurrentUser) : IThingService
{
    private readonly ThingRepository _userThingRepository = ThingRepository;
    private readonly ThingCategoryRepository _thingCategoryRepository = thingCategoryRepository;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly TripThingRepository _tripThingRepository = tripThingRepository;
    private readonly TripSharedRepository _tripSharedRepository = tripSharedRepository;
    private readonly DicTripRepository _dicTripRepository = dicTripRepository;

    public async Task<IEnumerable<ThingDto>> GetAllAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entities = await _userThingRepository.FindAsync(x => x.UserId == _currentUser.UserId);
        return _mapper.Map<IEnumerable<ThingDto>>(entities);
    }


    public async Task<IEnumerable<ThingDto>> GetAllForTripAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripThings = await _tripThingRepository.GetAllAsync(_currentUser.AdminId, _currentUser.UserId, tripId);
        var tripThingNames = new HashSet<string>(tripThings.Select(tp => tp.Name), StringComparer.OrdinalIgnoreCase);
        var dicThings = await _userThingRepository.FindAsync(x => x.UserId == _currentUser.UserId);

        var result = dicThings.Select(p =>
        {
            var dto = _mapper.Map<ThingDto>(p);
            dto.IsTargeted = tripThingNames.Contains(p.Name, StringComparer.OrdinalIgnoreCase);
            return dto;
        }).ToList();

        return result;
    }   

    public async Task<IEnumerable<ThingDto>> GetAllForTripSharedAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripSharedThings = await _tripSharedRepository.GetAllFullAsync(tripId);
        var tripThingNames = new HashSet<string>(tripSharedThings.Select(tp => tp.Name), StringComparer.OrdinalIgnoreCase);
        var dicThings = await _userThingRepository.FindAsync(x => x.UserId == _currentUser.UserId);

        var result = dicThings.Select(p =>
        {
            var dto = _mapper.Map<ThingDto>(p);
            dto.IsTargeted = tripThingNames.Contains(p.Name, StringComparer.OrdinalIgnoreCase);
            return dto;
        }).ToList();

        return result;
    }   

    public async Task<ThingDto?> GetByIdAsync(Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entity = await _userThingRepository.GetByIdAsync(_currentUser.UserId, id);
        return entity != null ? _mapper.Map<ThingDto>(entity) : null;
    }

    public async Task<ThingDto> AddAsync(CreateThingRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (await _userThingRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Name.ToLower() == request.Name.ToLower()))
        {
            throw new CustomException("Item with the same name already exists");
        }   

        var entity = _mapper.Map<UserThing>(request);
        entity.Id = Guid.NewGuid();
        entity.UserId = _currentUser.UserId;
        await _userThingRepository.AddAsync(entity);
        return _mapper.Map<ThingDto>(entity);
    }

    public async Task UpdateAsync(UpdateThingRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entity = await _userThingRepository.GetByIdAsync(_currentUser.UserId, request.Id);
        if (entity == null)
        {
            throw new CustomException("Item not found or access denied");
        }
        
        if (await _userThingRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Name.ToLower() == request.Name.ToLower() && x.Id != request.Id))
        {
            throw new CustomException("Another item with the same name already exists");
        }   

        _mapper.Map(request, entity);
        entity.UserId = _currentUser.UserId;
        await _userThingRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var exists = await _userThingRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Id == id);
        if (!exists)
        {
            throw new CustomException("Item not found or access denied");
        }
        await _userThingRepository.DeleteAsync(id);
    }

    public async Task<IEnumerable<ThingCategoryDto>> GetAllThingCategoriesAsync()
    {
        var categories = await _thingCategoryRepository.GetAllAsync();
        return categories.Select(c => new ThingCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Notes = c.Notes
        });
    }


    public async Task<int> InsertTemplateUserThingsAsync(Guid[] ids)
    {
        _currentUser.RaiseIfNotAuthenticated();
        return await _dicTripRepository.InsertTemplateUserThingsAsync(_currentUser.UserId, ids);
    }

    public async Task<int> DeleteTemplateUserThingsAsync(Guid[] ids)
    {
        _currentUser.RaiseIfNotAuthenticated();
        return await _dicTripRepository.DeleteTemplateUserThingsAsync(_currentUser.UserId, ids);
    }


}
