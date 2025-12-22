using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;

namespace plantour_server.Services;

public class UserThingService : IUserThingService
{
    private readonly ThingRepository _userThingRepository;
    private readonly ThingCategoryRepository _thingCategoryRepository;
    private readonly IMapper _mapper;

    public UserThingService(
        ThingRepository ThingRepository,
        ThingCategoryRepository thingCategoryRepository,
        IMapper mapper)
    {
        _userThingRepository = ThingRepository;
        _thingCategoryRepository = thingCategoryRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ThingDto>> GetAllAsync()
    {
        var entities = await _userThingRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<ThingDto>>(entities);
    }

    public async Task<ThingDto?> GetByIdAsync(Guid id)
    {
        var entity = await _userThingRepository.GetByIdAsync(id);
        return entity != null ? _mapper.Map<ThingDto>(entity) : null;
    }

    public async Task<ThingDto> AddAsync(CreateThingRequest request)
    {
        var entity = _mapper.Map<UserThing>(request);
        await _userThingRepository.AddAsync(entity);
        return _mapper.Map<ThingDto>(entity);
    }

    public async Task<bool> UpdateAsync(UpdateThingRequest request)
    {
        var entity = await _userThingRepository.GetByIdAsync(request.Id);
        if (entity == null)
        {
            return false;
        }
        
        _mapper.Map(request, entity);
        await _userThingRepository.UpdateAsync(entity);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _userThingRepository.GetByIdAsync(id);
        if (entity == null)
        {
            return false;
        }
        
        await _userThingRepository.DeleteAsync(id);
        return true;
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
