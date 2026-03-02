using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class SchedulerService(
    IMapper mapper,
    ICheckAccessService checkAccessService,
    HttpCurrentUser httpCurrentUser) : ISchedulerService
{
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;

    public void AddDowngradePlanTask()
    {
        //throw new NotImplementedException();
    }
}
