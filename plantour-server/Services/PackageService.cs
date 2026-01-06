using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class PackageService(
    PackageRepository PackageRepository,
    IMapper mapper,
    ICheckAccessService checkAccessService,
    TripPackageRepository tripPackageRepository,
    HttpCurrentUser httpCurrentUser) : IPackageService
{
    private readonly PackageRepository _userPackageRepository = PackageRepository;
    private readonly TripPackageRepository _tripPackageRepository = tripPackageRepository;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;

    public async Task<IEnumerable<PackageDto>> GetAllAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entities = await _userPackageRepository.FindAsync(x => x.UserId == _currentUser.UserId);
        return _mapper.Map<IEnumerable<PackageDto>>(entities);
    }
    public async Task<IEnumerable<PackageDto>> GetAllForTripAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripPackages = await _tripPackageRepository.GetAllAsync(_currentUser.AdminId, _currentUser.UserId, tripId);
        var tripPackageNames = new HashSet<string>(tripPackages.Select(tp => tp.Name), StringComparer.OrdinalIgnoreCase);
        var dicPackages = await _userPackageRepository.FindAsync(x => x.UserId == _currentUser.UserId);

        var result = dicPackages.Select(p =>
        {
            var dto = mapper.Map<PackageDto>(p);
            dto.IsTargeted = tripPackageNames.Contains(p.Name, StringComparer.OrdinalIgnoreCase);
            return dto;
        }).ToList();

        return result;
    }   

    public async Task<PackageDto?> GetByIdAsync(Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entity = await _userPackageRepository.GetByIdAsync(_currentUser.UserId, id);
        return entity != null ? _mapper.Map<PackageDto>(entity) : null;
    }

    public async Task<PackageDto> AddAsync(CreatePackageRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        var exists = await _userPackageRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Name.ToLower() == request.Name.ToLower());

        if (exists)
        {
            throw new CustomException("Package with the same name already exists");
        }

        var entity = _mapper.Map<UserPackage>(request);
        entity.Id = Guid.NewGuid();
        entity.UserId = _currentUser.UserId;
        await _userPackageRepository.AddAsync(entity);
        return _mapper.Map<PackageDto>(entity);
    }

    public async Task UpdateAsync(UpdatePackageRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entity = await _userPackageRepository.GetByIdAsync(_currentUser.UserId, request.Id);
        if (entity == null)
        {
            throw new CustomException("Package not found or access denied");
        }

        if (await _userPackageRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Name.ToLower() == request.Name.ToLower() && x.Id != request.Id))
        {
            throw new CustomException("Another package with the same name already exists");
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
            throw new CustomException("Package not found or access denied");
        }
        await _userPackageRepository.DeleteAsync(id);
    }
}
