using AutoMapper;
using Microsoft.Extensions.Options;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class SchedulerService(
    IOptions<JwtSettings> jwtSettings,
    RefreshTokenRepository refreshTokenRepository,
    LogsRepository logsRepository,
    IMapper mapper,
    ICheckAccessService checkAccessService,
    IConfiguration configuration,
    AiPromptRepository aiPromptRepository,
    HttpCurrentUser httpCurrentUser) : ISchedulerService
{

    private readonly JwtSettings _jwtSettings = jwtSettings.Value;

    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly IConfiguration _configuration = configuration;
    private readonly RefreshTokenRepository _refreshTokenRepository = refreshTokenRepository;
    private readonly LogsRepository _logsRepository = logsRepository;
    private readonly AiPromptRepository _aiPromptRepository = aiPromptRepository;

    public async Task DeleteExpiredRefreshTokensAsync()
    {
        await _refreshTokenRepository.DeleteRangeAsync(x => x.ExpiresAt < DateTime.UtcNow, CancellationToken.None);
    }

    public async Task DeleteOldAIPromptsAsync()
    {
        await _aiPromptRepository.DeleteRangeAsync(x => x.CreatedAt < DateTime.UtcNow.AddMonths(-1), CancellationToken.None);
    }

    public async Task DeleteOldErrorLogsAsync()
    {
        await _logsRepository.DeleteRangeAsync(x => x.TimeStamp < DateTime.UtcNow.AddDays(-7) && x.Level != null && x.Level.ToLower() == "error", CancellationToken.None);
    }
}

