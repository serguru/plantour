using AutoMapper;
using plantour_maintenance_server.DTOs;
using plantour_maintenance_server.Middleware;
using plantour_maintenance_server.Repositories;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Services;

public class UsersService(
    SuperuserRepository superuserRepository,
    CurrentSuperuserAccessor currentSuperuserAccessor,
    IMapper mapper) : IUsersService
{
    private readonly SuperuserRepository _superuserRepository = superuserRepository;
    private readonly CurrentSuperuserAccessor _currentSuperuserAccessor = currentSuperuserAccessor;
    private readonly IMapper _mapper = mapper;

    public async Task<IReadOnlyList<UserDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var users = await _superuserRepository.GetAllOrderedAsync();
        return _mapper.Map<IReadOnlyList<UserDto>>(users);
    }

    public async Task<UserDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _superuserRepository.GetByIdAsync(id);
        if (user == null)
        {
            throw new NotFoundException("Superuser not found.", "SUPERUSER_NOT_FOUND");
        }

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> GetCurrentAsync(CancellationToken cancellationToken = default)
    {
        var currentUser = _currentSuperuserAccessor.GetRequiredCurrentUser();
        var user = await _superuserRepository.GetByIdAsync(currentUser.Id);

        if (user == null)
        {
            throw new NotFoundException("Superuser not found.", "SUPERUSER_NOT_FOUND");
        }

        return _mapper.Map<UserDto>(user);
    }
}

// TODO: cleanup tokens
// TODO: Amazon links on the public tempates
