using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;

namespace plantour_server.Services;

public class AdminsParticipantService : IAdminsParticipantService
{
    private readonly AdminsParticipantRepository _adminsParticipantRepository;
    private readonly IMapper _mapper;

    public AdminsParticipantService(
        AdminsParticipantRepository adminsParticipantRepository,
        IMapper mapper)
    {
        _adminsParticipantRepository = adminsParticipantRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<AdminsParticipantDto>> GetAllAsync()
    {
        var entities = await _adminsParticipantRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<AdminsParticipantDto>>(entities);
    }

    public async Task<AdminsParticipantDto?> GetByIdAsync(Guid id)
    {
        var entity = await _adminsParticipantRepository.GetByIdAsync(id);
        return entity != null ? _mapper.Map<AdminsParticipantDto>(entity) : null;
    }

    public async Task<AdminsParticipantDto?> GetByEmailAsync(string email)
    {
        var entity = await _adminsParticipantRepository.GetByEmailAsync(email);
        return entity != null ? _mapper.Map<AdminsParticipantDto>(entity) : null;
    }

    public async Task<AdminsParticipantDto> AddAsync(CreateAdminsParticipantRequest request)
    {
        var entity = _mapper.Map<AdminsParticipant>(request);
        await _adminsParticipantRepository.AddAsync(entity);
        return _mapper.Map<AdminsParticipantDto>(entity);
    }

    public async Task<bool> UpdateAsync(UpdateAdminsParticipantRequest request)
    {
        var entity = await _adminsParticipantRepository.GetByIdAsync(request.Id);
        if (entity == null)
        {
            return false;
        }
        
        _mapper.Map(request, entity);
        await _adminsParticipantRepository.UpdateAsync(entity);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _adminsParticipantRepository.GetByIdAsync(id);
        if (entity == null)
        {
            return false;
        }
        
        await _adminsParticipantRepository.DeleteAsync(id);
        return true;
    }
}
