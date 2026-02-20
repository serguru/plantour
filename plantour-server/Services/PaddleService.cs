using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Repositories;
using plantour_server.Utils;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class PaddleService(
    AdminsParticipantRepository adminsParticipantRepository,
    TripUserRepository tripUserRepository,
    UsersRepository usersRepository,
    IMapper mapper,
    ICheckAccessService checkAccessService,
    AccessCodeGenerator accessCodeGenerator,
    HttpCurrentUser httpCurrentUser) : IPaddleService
{
    private readonly AdminsParticipantRepository _adminsParticipantRepository = adminsParticipantRepository;
    private readonly TripUserRepository _tripUserRepository = tripUserRepository;
    private readonly UsersRepository _userRepository = usersRepository;
    private readonly AccessCodeGenerator _accessCodeGenerator = accessCodeGenerator;


    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly IMapper _mapper = mapper;

    private readonly ICheckAccessService _checkAccessService = checkAccessService;

    public async Task<string> ProcessSuccessfulPaymentAsync(PaddlePaymentRequest request)
    {
        return "";
/*        
Expected Paddle response:
{
  "data": {
    "id": "ctm_01hrffh7gvp29kc7xahm8wddwa",
    "status": "active",
    "custom_data": null,
    "name": "Sam Miller",
    "email": "sam@example.com",
    "marketing_consent": false,
    "locale": "en",
    "created_at": "2024-03-08T16:49:53.691Z",
    "updated_at": "2024-04-11T16:03:57.924146Z",
    "import_meta": null
  },
  "meta": {
    "request_id": "aa0009cb-18f7-4538-b1cd-ad29d91cfaa7"
  }
}
*/


    }
}
