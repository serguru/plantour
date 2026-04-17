using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using plantour_server.DbModels;
using plantour_server.Logging;
using plantour_server.Models;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class SchedulerService(
    IOptions<JwtSettings> jwtSettings,
    RefreshTokenRepository refreshTokenRepository,
    PlantourContext plantourContext,
    ICheckAccessService checkAccessService,
    IConfiguration configuration,
    AiPromptRepository aiPromptRepository,
    IPaymentProcessorService paymentProcessorService,
    IPlantourLogger logger,
    HttpCurrentUser httpCurrentUser) : ISchedulerService
{

    private readonly JwtSettings _jwtSettings = jwtSettings.Value;

    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly IConfiguration _configuration = configuration;
    private readonly PlantourContext _plantourContext = plantourContext;
    private readonly RefreshTokenRepository _refreshTokenRepository = refreshTokenRepository;
    private readonly AiPromptRepository _aiPromptRepository = aiPromptRepository;
    private readonly IPaymentProcessorService _paymentProcessorService = paymentProcessorService;

    private readonly IPlantourLogger _logger = logger;

    public async Task DeleteExpiredRefreshTokensAsync()
    {
        await _refreshTokenRepository.DeleteRangeAsync(x => x.ExpiresAt < DateTime.UtcNow);
    }

    public async Task DeleteOldAIPromptsAsync()
    {
        await _aiPromptRepository.DeleteRangeAsync(x => x.CreatedAt < DateTime.UtcNow.AddMonths(-1));
    }

    public async Task DeleteOldTripUserImprovementsLogAsync()
    {
        var cutoffUtc = DateTime.UtcNow.AddDays(-1);

        await _plantourContext.TripUserImprovementsLogs
            .Where(x => x.CreatedAt.HasValue && x.CreatedAt.Value < cutoffUtc)
            .ExecuteDeleteAsync();
    }

    public async Task ScheduleOrRunDowngradePlanPriceAsync(string oldPlanPrice, string newPlanPrice)
    {
        _currentUser.RaiseIfNotAdmin();
        await _paymentProcessorService.ScheduleDowngradePlanPriceAsync(_currentUser.UserId, oldPlanPrice, newPlanPrice);
    }


}

