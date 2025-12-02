using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Mapping;
using plantour_server.Repositories;

namespace plantour_server.Services;

public class UserPackageService : IUserPackageService
{
    private readonly UserPackageRepository _repository;
    private readonly PackageCategoryRepository _categoryRepository;
    private readonly UserPackageMapper _mapper;

    public UserPackageService(UserPackageRepository repository, PackageCategoryRepository categoryRepository)
    {
        _repository = repository;
        _categoryRepository = categoryRepository;
        _mapper = new UserPackageMapper();
    }

    public async Task<IEnumerable<UserPackageDto>> GetAllAsync()
    {
        var userPackages = await _repository.GetAllAsync();
        var dtos = _mapper.ToDtos(userPackages);
        
        var categories = await _categoryRepository.GetAllAsync();
        var categoriesLookup = _mapper.ToCategoryLookups(categories);
        
        foreach (var dto in dtos)
        {
            dto.CategoriesLookup = categoriesLookup;
        }
        
        return dtos;
    }

    public async Task<UserPackageDto?> GetByIdAsync(Guid id)
    {
        var userPackage = await _repository.GetByIdAsync(id);
        if (userPackage == null)
            return null;
            
        var dto = _mapper.ToDto(userPackage);
        
        var categories = await _categoryRepository.GetAllAsync();
        dto.CategoriesLookup = _mapper.ToCategoryLookups(categories);
        
        return dto;
    }

    public async Task<UserPackageDto> AddAsync(CreateUserPackageRequest request)
    {
        var userPackage = _mapper.ToEntity(request);
        userPackage.Id = Guid.NewGuid();
        
        var created = await _repository.AddAsync(userPackage);
        var dto = _mapper.ToDto(created);
        
        var categories = await _categoryRepository.GetAllAsync();
        dto.CategoriesLookup = _mapper.ToCategoryLookups(categories);
        
        return dto;
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateUserPackageRequest request)
    {
        var userPackage = await _repository.GetByIdAsync(id);
        if (userPackage == null)
        {
            return false;
        }

        if (request.CategoryId.HasValue)
        {
            userPackage.CategoryId = request.CategoryId;
        }

        if (!string.IsNullOrEmpty(request.ShortDescription))
        {
            userPackage.ShortDescription = request.ShortDescription;
        }

        if (request.Description != null)
        {
            userPackage.Description = request.Description;
        }

        await _repository.UpdateAsync(userPackage);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var exists = await _repository.ExistsAsync(id);
        if (!exists)
        {
            return false;
        }

        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _repository.ExistsAsync(id);
    }
}
