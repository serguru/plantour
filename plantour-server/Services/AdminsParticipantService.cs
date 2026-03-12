using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using plantour_server.Utils;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class AdminsParticipantService(
    AdminsParticipantRepository adminsParticipantRepository,
    TripUserRepository tripUserRepository,
    UsersRepository usersRepository,
    IMapper mapper,
    ICheckAccessService checkAccessService,
    AccessCodeGenerator accessCodeGenerator,
    HttpCurrentUser httpCurrentUser) : IAdminsParticipantService
{
    private readonly AdminsParticipantRepository _adminsParticipantRepository = adminsParticipantRepository;
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
    private readonly UsersRepository _userRepository = usersRepository;
    private readonly AccessCodeGenerator _accessCodeGenerator = accessCodeGenerator;


    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly IMapper _mapper = mapper;

    private readonly ICheckAccessService _checkAccessService = checkAccessService;


    public async Task<IEnumerable<AdminsParticipantDto>> GetAllAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();

        // For both admin and participant, return all participants for the admin
        IEnumerable<AdminsParticipant> entities = await _adminsParticipantRepository.FindFullAsync(x => x.AdminId == _currentUser.AdminId);
        return _mapper.Map<IEnumerable<AdminsParticipantDto>>(entities);
    }

    public async Task<CheckParticipantDto> CheckParticipant(string email)
    {
        _currentUser.RaiseIfNotAdmin();

        var adminsParticipant = (await _adminsParticipantRepository
        .FindFullAsync(x => x.Admin.Email.ToLower() == email.ToLower() || x.Participant.Email.ToLower() == email.ToLower())).FirstOrDefault();
        

        if (adminsParticipant != null)
        {
            if (adminsParticipant.Admin.Email.ToLower() == email.ToLower())
            {
                return new CheckParticipantDto
                {
                    FoundUserId = adminsParticipant.AdminId,
                    Status = CheckParticipantStatus.AlreadyParticipant
                };
            }
            else if (adminsParticipant.Participant.Email.ToLower() == email.ToLower())
            {
                return new CheckParticipantDto
                {
                    FoundUserId = adminsParticipant.ParticipantId,
                    Status = CheckParticipantStatus.AlreadyParticipant
                };
            }
        }

        var user = (await _userRepository.FindAsync(x => x.Email.ToLower() == email.ToLower())).FirstOrDefault();

        if (user != null)
        {
            return new CheckParticipantDto
            {
                FoundUserId = user.Id,
                Status = CheckParticipantStatus.UserExistsNotParticipant
            };
        }  


        return new CheckParticipantDto
        {
            FoundUserId = null,
            Status = CheckParticipantStatus.NotFound
        };
    }   

    public async Task<IEnumerable<AdminsParticipantDto>> GetAllForTripAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripParticipants = await _tripUserRepository.GetAllAsync(_currentUser.AdminId, tripId);
        var tripParticipantsEmails = new HashSet<string>(tripParticipants.Select(tp => tp.AdminParticipant.Participant.Email), StringComparer.OrdinalIgnoreCase);
        var dicParticipants = await _adminsParticipantRepository.FindFullAsync(x => x.AdminId == _currentUser.AdminId);

        var result = dicParticipants.Select(p =>
        {
            var dto = _mapper.Map<AdminsParticipantDto>(p);
            dto.IsTargeted = tripParticipantsEmails.Contains(dto.Email, StringComparer.OrdinalIgnoreCase);
            return dto;
        }).ToList();

        return result;
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
            throw new CustomException("Admin participant not found or access denied");
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
            throw new CustomException("Admin participant not found or access denied");
        }

        await _adminsParticipantRepository.DeleteAsync(id);
    }
    public async Task<Tuple<string, string>> GenerateAccessCodeAsync()
    {
        string accessCode = "";
        string accessCodeHash = "";
        for (int i = 0; i < 100; i++)
        {
            accessCode = _accessCodeGenerator.GenerateAccessCode();
            accessCodeHash = _accessCodeGenerator.AccessCode2Hash(accessCode);
            if (!await _adminsParticipantRepository.AnyAsync(x => x.AccessCodeHash == accessCodeHash))
            {
                break;
            }
            if (i == 99)
            {
                throw new CustomException("Failed to generate unique access code after multiple attempts");
            }
        }
        return Tuple.Create(accessCode, accessCodeHash);
    }

}
