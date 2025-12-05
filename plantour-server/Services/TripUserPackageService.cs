using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;

namespace plantour_server.Services;

public class TripUserPackageService : ITripUserPackageService
{
    private readonly TripUserPackageRepository _tripUserPackageRepository;
    private readonly IMapper _mapper;

    public TripUserPackageService(
        TripUserPackageRepository tripUserPackageRepository,
        IMapper mapper)
    {
        _tripUserPackageRepository = tripUserPackageRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<TripUserPackageDto>> GetAllAsync(Guid tripId)
    {
        var entities = await _tripUserPackageRepository.GetAllAsync(tripId);
        return _mapper.Map<IEnumerable<TripUserPackageDto>>(entities);
    }

    public async Task<TripUserPackageDto?> GetByIdAsync(Guid id)
    {
        var entity = await _tripUserPackageRepository.GetByIdAsync(id);
        return entity != null ? _mapper.Map<TripUserPackageDto>(entity) : null;
    }

    public async Task<TripUserPackageDto> AddAsync(CreateTripUserPackageRequest request)
    {
        var entity = _mapper.Map<TripUserPackage>(request);
        await _tripUserPackageRepository.AddAsync(request.TripId, entity);
        return _mapper.Map<TripUserPackageDto>(entity);
    }

    public async Task<bool> UpdateAsync(UpdateTripUserPackageRequest request)
    {
        var entity = await _tripUserPackageRepository.GetByIdAsync(request.Id);
        if (entity == null)
        {
            return false;
        }
        
        _mapper.Map(request, entity);
        await _tripUserPackageRepository.UpdateAsync(entity);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _tripUserPackageRepository.GetByIdAsync(id);
        if (entity == null)
        {
            return false;
        }
        
        await _tripUserPackageRepository.DeleteAsync(id);
        return true;
    }
}
