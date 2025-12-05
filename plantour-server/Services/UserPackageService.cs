using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;

namespace plantour_server.Services;

public class UserPackageService : IUserPackageService
{
    private readonly UserPackageRepository _userPackageRepository;
    private readonly IMapper _mapper;

    public UserPackageService(
        UserPackageRepository userPackageRepository,
        IMapper mapper)
    {
        _userPackageRepository = userPackageRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UserPackageDto>> GetAllAsync()
    {
        var entities = await _userPackageRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<UserPackageDto>>(entities);
    }

    public async Task<UserPackageDto?> GetByIdAsync(Guid id)
    {
        var entity = await _userPackageRepository.GetByIdAsync(id);
        return entity != null ? _mapper.Map<UserPackageDto>(entity) : null;
    }

    public async Task<UserPackageDto> AddAsync(CreateUserPackageRequest request)
    {
        var entity = _mapper.Map<UserPackage>(request);
        await _userPackageRepository.AddAsync(entity);
        return _mapper.Map<UserPackageDto>(entity);
    }

    public async Task<bool> UpdateAsync(UpdateUserPackageRequest request)
    {
        var entity = await _userPackageRepository.GetByIdAsync(request.PackageId);
        if (entity == null)
        {
            return false;
        }
        
        _mapper.Map(request, entity);
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
}
