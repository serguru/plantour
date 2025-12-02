using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Mapping;
using plantour_server.Repositories;

namespace plantour_server.Services;

public class UserThingService : BaseService, IUserThingService
{
    private readonly UserThingRepository _userThingRepository;
    private readonly ThingCategoryRepository _thingCategoryRepository;
    private readonly UserThingMapper _mapper;

    public UserThingService(
        UserThingRepository userThingRepository,
        ThingCategoryRepository thingCategoryRepository,
        IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
    {
        _userThingRepository = userThingRepository;
        _thingCategoryRepository = thingCategoryRepository;
        _mapper = new UserThingMapper();
    }

    public async Task<IEnumerable<UserThingDto>> GetAllAsync()
    {
        var entities = await _userThingRepository.GetAllAsync();
        return _mapper.ToDtos(entities);
    }

    public async Task<UserThingDto?> GetByIdAsync(Guid id)
    {
        var entity = await _userThingRepository.GetByIdAsync(id);
        return entity != null ? _mapper.ToDto(entity) : null;
    }

    public async Task<UserThingDto> AddAsync(CreateUserThingRequest request)
    {
        var entity = _mapper.ToEntity(request);
        await _userThingRepository.AddAsync(entity);
        return _mapper.ToDto(entity);
    }

    public async Task<bool> UpdateAsync(UpdateUserThingRequest request)
    {
        var entity = await _userThingRepository.GetByIdAsync(request.ThingId);
        if (entity == null)
        {
            return false;
        }
        
        _mapper.UpdateEntity(request, entity);
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
