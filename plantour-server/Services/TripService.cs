using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;

namespace plantour_server.Services;

public class TripService : BaseService, ITripService
{
    private readonly TripRepository _tripRepository;
    private readonly IMapper _mapper;

    public TripService(
        TripRepository tripRepository,
        IHttpContextAccessor httpContextAccessor,
        IMapper mapper) : base(httpContextAccessor)
    {
        _tripRepository = tripRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<TripDto>> GetAllAsync()
    {
        var entities = await _tripRepository.GetAllAsync(Guid.Empty);
        return _mapper.Map<IEnumerable<TripDto>>(entities);
    }

    public async Task<TripDto?> GetByIdAsync(Guid id)
    {
        var entity = await _tripRepository.GetByIdAsync(id);
        return entity != null ? _mapper.Map<TripDto>(entity) : null;
    }

    public async Task<TripDto> AddAsync(CreateTripRequest request)
    {
        var entity = _mapper.Map<Trip>(request);
        await _tripRepository.AddAsync(entity);
        return _mapper.Map<TripDto>(entity);
    }

    public async Task<bool> UpdateAsync(UpdateTripRequest request)
    {
        var entity = await _tripRepository.GetByIdAsync(request.TripId);
        if (entity == null)
        {
            return false;
        }
        
        _mapper.Map(request, entity);
        await _tripRepository.UpdateAsync(entity);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _tripRepository.GetByIdAsync(id);
        if (entity == null)
        {
            return false;
        }
        
        await _tripRepository.DeleteAsync(id);
        return true;
    }
}
