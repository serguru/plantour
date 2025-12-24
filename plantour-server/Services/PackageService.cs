using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Models;

namespace plantour_server.Services;

public class PackageService(
    PackageRepository PackageRepository,
    IMapper mapper,
HttpCurrentUser httpCurrentUser) : IPackageService
{
    private readonly PackageRepository _userPackageRepository = PackageRepository;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;

    public async Task<IEnumerable<UserPackageDto>> GetAllAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entities = await _userPackageRepository.FindAsync(x => x.UserId == _currentUser.UserId);
        return _mapper.Map<IEnumerable<UserPackageDto>>(entities);
    }

    public async Task<UserPackageDto?> GetByIdAsync(Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entity = await _userPackageRepository.GetByIdAsync(_currentUser.UserId, id);
        return entity != null ? _mapper.Map<UserPackageDto>(entity) : null;
    }

    public async Task<UserPackageDto> AddAsync(CreatePackageRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        var exists = await _userPackageRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Name.ToLower() == request.Name.ToLower());

        if (exists)
        {
            throw new InvalidOperationException("Package with the same name already exists");
        }

        var entity = _mapper.Map<UserPackage>(request);
        entity.Id = Guid.NewGuid();
        entity.UserId = _currentUser.UserId;
        await _userPackageRepository.AddAsync(entity);
        return _mapper.Map<UserPackageDto>(entity);
    }

    public async Task UpdateAsync(UpdatePackageRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entity = await _userPackageRepository.GetByIdAsync(_currentUser.UserId, request.Id);
        if (entity == null)
        {
            throw new InvalidOperationException("Package not found or access denied");
        }
        
        if (await _userPackageRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Name.ToLower() == request.Name.ToLower() && x.Id != request.Id))
        {
            throw new InvalidOperationException("Another package with the same name already exists");
        }   

        _mapper.Map(request, entity);
        entity.UserId = _currentUser.UserId;
        await _userPackageRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var exists = await _userPackageRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Id == id);
        if (!exists)
        {
            throw new InvalidOperationException("Package not found or access denied");
        }
        await _userPackageRepository.DeleteAsync(id);
    }
}
