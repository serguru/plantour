using AutoMapper;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using plantour_server.Services.TickerQ;
using PlantourApi.Middleware;
using PlantourApi.Models;
using TickerQ.Utilities.Entities;
using TickerQ.Utilities.Interfaces.Managers;

namespace plantour_server.Services;

public class SchedulerService(
    IOptions<JwtSettings> jwtSettings,
    RefreshTokenRepository refreshTokenRepository,
    LogsRepository logsRepository,
    IMapper mapper,
    ICheckAccessService checkAccessService,
    IConfiguration configuration,
    AiPromptRepository aiPromptRepository,
    ITimeTickerManager<TimeTickerEntity> timeTickerManager,
    IPaddleService _paddleService,
    ILogger<SchedulerService> logger,
    TimeTickerRepository timeTickerRepository,
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
    private readonly ITimeTickerManager<TimeTickerEntity> _timeTickerManager = timeTickerManager;
    private readonly IPaddleService _paddleService = _paddleService;
    private readonly TimeTickerRepository _timeTickerRepository = timeTickerRepository;

    private readonly ILogger<SchedulerService> _logger = logger;

    public async Task DeleteExpiredRefreshTokensAsync()
    {
        await _refreshTokenRepository.DeleteRangeAsync(x => x.ExpiresAt < DateTime.UtcNow);
    }

    public async Task DeleteOldAIPromptsAsync()
    {
        await _aiPromptRepository.DeleteRangeAsync(x => x.CreatedAt < DateTime.UtcNow.AddMonths(-1));
    }

    public async Task DeleteOldErrorLogsAsync()
    {
        await _logsRepository.DeleteRangeAsync(x => x.TimeStamp < DateTime.UtcNow.AddDays(-7) && x.Level != null && x.Level.ToLower() == "error");
    }

    // TODO: explain to the users in help or policy 1 hour before payment downgrade is not possible
    public async Task ScheduleOrRunDowngradePlanPriceAsync(string oldPlanPrice, string newPlanPrice)
    {
        _currentUser.RaiseIfNotAdmin();
        var userId = _currentUser.UserId;
        // If it is less than 12 hours left to the next billing period - run
        var subscription = await _paddleService.GetActiveSubscriptionByUserIdAsync(userId, UserRole.Admin, userId);

        if (subscription == null)
        {
            throw new CustomException("No active subscription found for the user");
        }

        var nextBillingDate = subscription.BillingPeriodEnd;
        if (string.IsNullOrEmpty(nextBillingDate))
        {
            throw new CustomException("Subscription does not have a valid next billing date");
        }

        bool parsed = DateTime.TryParse(nextBillingDate, out DateTime nextBillingDateTime);
        if (!parsed)
        {
            throw new CustomException("Subscription does not have a valid next billing date");
        }

        var utcNow = DateTime.UtcNow;

        if (nextBillingDateTime < utcNow)
        {
            throw new CustomException("Subscription next billing date is in the past");
        }

        if (nextBillingDateTime - utcNow <= TimeSpan.FromHours(1))
        {
            throw new CustomException("Cannot downgrade if the next payment within 1 hour from now");
        }

        if (nextBillingDateTime - utcNow <= TimeSpan.FromHours(12))
        {
            await _paddleService.DowngradePlanPriceAsync(userId, oldPlanPrice, newPlanPrice);
            return;
        }


        // Kill any previously scheduled plan downgrade for this user
        await _timeTickerRepository.CancelLatestActiveByFunctionAndIdentifierAsync(
            TickerQPlanDowngradeTask.FunctionName,
            userId.ToString());

        // Schedule a job

        var payload = new TickerQPlanDowngradeTask.PlanDowngradePayload
        {
            UserId = userId,
            OldPlanPrice = oldPlanPrice,
            NewPlanPrice = newPlanPrice
        };

        var executionTime = nextBillingDateTime.AddHours(-12);

        var addResult = await _timeTickerManager.AddAsync(new TimeTickerEntity
        {
            Function = TickerQPlanDowngradeTask.FunctionName,
            Description = $"Plan downgrade from '{oldPlanPrice}' to '{newPlanPrice}'",
            ExecutionTime = executionTime,
            Request = JsonSerializer.SerializeToUtf8Bytes(payload)
        });

        if (!addResult.IsSucceeded)
        {
            throw new CustomException("Failed to schedule downgrade plan job");
        }

        var createdJob = await _timeTickerRepository.GetByIdAsync(addResult.Result.Id);

        if (createdJob == null)
        {
            throw new CustomException("Failed to retrieve a newly created job");
        }
        createdJob.InitIdentifier = userId.ToString();
        createdJob.UpdatedAt = DateTime.UtcNow;
        await _timeTickerRepository.UpdateAsync(createdJob);

        _logger.LogInformation(
            "Downgrade plan job scheduled. JobId: {JobId}, UserId: {UserId}, OldPlanPrice: {OldPlanPrice}, NewPlanPrice: {NewPlanPrice}, ExecutionTimeUtc: {ExecutionTimeUtc}",
            addResult.Result.Id,
            userId,
            oldPlanPrice,
            newPlanPrice,
            executionTime);
    }


}

