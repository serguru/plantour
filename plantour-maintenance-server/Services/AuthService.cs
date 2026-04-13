using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using plantour_maintenance_server.DTOs;
using plantour_maintenance_server.Middleware;
using plantour_maintenance_server.Repositories;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Services;

public class AuthService(
    SuperuserRepository superuserRepository,
    IJwtTokenService jwtTokenService,
    IMapper mapper) : IAuthService
{
    private readonly SuperuserRepository _superuserRepository = superuserRepository;
    private readonly IJwtTokenService _jwtTokenService = jwtTokenService;
    private readonly IMapper _mapper = mapper;

    public async Task<AuthResponse> SignInAsync(SignInRequest request, CancellationToken cancellationToken = default)
    {
        var superuser = await _superuserRepository.GetByEmailAsync(request.Email);
        if (superuser == null)
        {
            throw new UnauthorizedException("Invalid email or password.", "INVALID_CREDENTIALS");
        }

        var hashedPassword = await _superuserRepository.HashPasswordAsync(request.Password, cancellationToken);
        if (!HashesMatch(superuser.HashedPassword, hashedPassword))
        {
            throw new UnauthorizedException("Invalid email or password.", "INVALID_CREDENTIALS");
        }

        var token = _jwtTokenService.CreateToken(superuser);

        return new AuthResponse
        {
            AccessToken = token.AccessToken,
            ExpiresAtUtc = token.ExpiresAtUtc,
            User = _mapper.Map<UserDto>(superuser)
        };
    }

    public async Task<string> HashPasswordAsync(string password, CancellationToken cancellationToken = default)
    {
        return await _superuserRepository.HashPasswordAsync(password, cancellationToken);
    }

    private static bool HashesMatch(string left, string right)
    {
        var leftBytes = Encoding.UTF8.GetBytes(left);
        var rightBytes = Encoding.UTF8.GetBytes(right);

        if (leftBytes.Length != rightBytes.Length)
        {
            return false;
        }

        return CryptographicOperations.FixedTimeEquals(leftBytes, rightBytes);
    }
}