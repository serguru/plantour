using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Models;

namespace plantour_server.Services;

public class AdminsParticipantService(
    AdminsParticipantRepository adminsParticipantRepository,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser) : IAdminsParticipantService
{
    private readonly AdminsParticipantRepository _adminsParticipantRepository = adminsParticipantRepository;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly IMapper _mapper = mapper;

    public async Task<IEnumerable<AdminsParticipantDto>> GetAllAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();

        // For both admin and participant, return all participants for the admin
        IEnumerable<AdminsParticipant> entities = await _adminsParticipantRepository.FindFullAsync(x => x.AdminId == _currentUser.AdminId);
        return _mapper.Map<IEnumerable<AdminsParticipantDto>>(entities);
    }

    public async Task<AdminsParticipantDto?> GetByIdAsync(Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        var entities = await _adminsParticipantRepository.FindFullAsync(x => x.Id == id && x.AdminId == _currentUser.AdminId);

        AdminsParticipant? entity = entities.FirstOrDefault();
        
        return entity != null ? _mapper.Map<AdminsParticipantDto>(entity) : null;
    }

    public async Task UpdateAsync(UpdateAdminsParticipantRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        var entities = await _adminsParticipantRepository.FindAsync(x => x.Id == request.Id && x.AdminId == _currentUser.AdminId);
        AdminsParticipant? entity = entities.FirstOrDefault();

        if (entity == null)
        {
            throw new InvalidOperationException("Admin participant not found or access denied");
        }
        
        _mapper.Map(request, entity);
        await _adminsParticipantRepository.UpdateAsync(entity!);
        
    }

    public async Task DeleteAsync(Guid id)
    {
        _currentUser.RaiseIfNotAdmin();

        var entityExists = await _adminsParticipantRepository.AnyAsync(x => x.Id == id && x.AdminId == _currentUser.AdminId);

        if (!entityExists)
        {
            throw new InvalidOperationException("Admin participant not found or access denied");
        }

        await _adminsParticipantRepository.DeleteAsync(id);
    }

}
