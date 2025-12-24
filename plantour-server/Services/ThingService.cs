using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Models;

namespace plantour_server.Services;

public class ThingService(
    ThingRepository ThingRepository,
    ThingCategoryRepository thingCategoryRepository,
    IMapper mapper,
HttpCurrentUser httpCurrentUser) : IThingService
{
    private readonly ThingRepository _userThingRepository = ThingRepository;
    private readonly ThingCategoryRepository _thingCategoryRepository = thingCategoryRepository;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;

    public async Task<IEnumerable<ThingDto>> GetAllAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entities = await _userThingRepository.FindAsync(x => x.UserId == _currentUser.UserId);
        return _mapper.Map<IEnumerable<ThingDto>>(entities);
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
            throw new InvalidOperationException("Thing with the same name already exists");
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
            throw new InvalidOperationException("Thing not found or access denied");
        }
        
        if (await _userThingRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Name.ToLower() == request.Name.ToLower() && x.Id != request.Id))
        {
            throw new InvalidOperationException("Another thing with the same name already exists");
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
            throw new InvalidOperationException("Thing not found or access denied");
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
}
