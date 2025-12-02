using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Mapping;
using plantour_server.Repositories;

namespace plantour_server.Services;

public class UserPackageService : BaseService, IUserPackageService
{
    private readonly UserPackageRepository _userPackageRepository;
    private readonly PackageCategoryRepository _packageCategoryRepository;
    private readonly UserPackageMapper _mapper;

    public UserPackageService(
        UserPackageRepository userPackageRepository,
        PackageCategoryRepository packageCategoryRepository,
        IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
    {
        _userPackageRepository = userPackageRepository;
        _packageCategoryRepository = packageCategoryRepository;
        _mapper = new UserPackageMapper();
    }

    public async Task<IEnumerable<UserPackageDto>> GetAllAsync()
    {
        var entities = await _userPackageRepository.GetAllAsync();
        return _mapper.ToDtos(entities);
    }

    public async Task<UserPackageDto?> GetByIdAsync(Guid id)
    {
        var entity = await _userPackageRepository.GetByIdAsync(id);
        return entity != null ? _mapper.ToDto(entity) : null;
    }

    public async Task<UserPackageDto> AddAsync(CreateUserPackageRequest request)
    {
        var entity = _mapper.ToEntity(request);
        await _userPackageRepository.AddAsync(entity);
        return _mapper.ToDto(entity);
    }

    public async Task<bool> UpdateAsync(UpdateUserPackageRequest request)
    {
        var entity = await _userPackageRepository.GetByIdAsync(request.PackageId);
        if (entity == null)
        {
            return false;
        }
        
        _mapper.UpdateEntity(request, entity);
        await _userPackageRepository.UpdateAsync(entity);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _userPackageRepository.GetByIdAsync(id);
        if (entity == null)
        {
            return false;
        }
        
        await _userPackageRepository.DeleteAsync(id);
        return true;
    }

    public async Task<IEnumerable<PackageCategoryDto>> GetAllPackageCategoriesAsync()
    {
        var categories = await _packageCategoryRepository.GetAllAsync();
        return categories.Select(c => new PackageCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Notes = c.Notes
        });
    }
}
