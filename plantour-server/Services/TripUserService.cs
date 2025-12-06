using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;

namespace plantour_server.Services;

public class TripUserService : ITripUserService
{
    private readonly TripUserRepository _tripUserRepository;
    private readonly IMapper _mapper;

    public TripUserService(
        TripUserRepository tripUserRepository,
        IMapper mapper)
    {
        _tripUserRepository = tripUserRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<TripUserDto>> GetAllAsync(Guid tripId)
    {
        var entities = await _tripUserRepository.GetAllAsync(tripId);
        return _mapper.Map<IEnumerable<TripUserDto>>(entities);
    }

    public async Task<TripUserDto?> GetByIdAsync(Guid id)
    {
        var entity = await _tripUserRepository.GetByIdAsync(id);
        return entity != null ? _mapper.Map<TripUserDto>(entity) : null;
    }

    public async Task<TripUserDto> AddAsync(CreateTripUserRequest request)
    {
        var entity = _mapper.Map<TripUser>(request);
        await _tripUserRepository.AddAsync(entity);
        return _mapper.Map<TripUserDto>(entity);
    }

    public async Task<bool> UpdateAsync(UpdateTripUserRequest request)
    {
        var entity = await _tripUserRepository.GetByIdAsync(request.Id);
        if (entity == null)
        {
            return false;
        }
        
        _mapper.Map(request, entity);
        await _tripUserRepository.UpdateAsync(entity);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _tripUserRepository.GetByIdAsync(id);
        if (entity == null)
        {
            return false;
        }
        
        await _tripUserRepository.DeleteAsync(id);
        return true;
    }
}
