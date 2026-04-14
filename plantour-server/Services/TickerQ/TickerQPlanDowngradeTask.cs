using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;
using plantour_server.Logging;
using plantour_server.Services.Interfaces;
using TickerQ.Utilities.Base;

namespace plantour_server.Services.TickerQ;

public class TickerQPlanDowngradeTask
{
    public const string FunctionName = "Plantour_PlanDowngrade";

    private readonly IPaddleService _paddleService;
    private readonly PlantourContext _context;
    private readonly IPlantourLogger _logger;

    public TickerQPlanDowngradeTask(
        IPaddleService paddleService,
        PlantourContext context,
        IPlantourLogger logger)
    {
        _paddleService = paddleService;
        _context = context;
        _logger = logger;
    }

    [TickerFunction(FunctionName)]
    public async Task RunAsync(TickerFunctionContext context, CancellationToken cancellationToken)
    {
        var ticker = await _context.TimeTickers
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == context.Id, cancellationToken)
            ?? throw new InvalidOperationException($"TickerQ downgrade job '{context.Id}' not found.");

        if (ticker.Request == null || ticker.Request.Length == 0)
        {
            throw new InvalidOperationException("TickerQ downgrade payload is missing.");
        }

        var payload = JsonSerializer.Deserialize<PlanDowngradePayload>(ticker.Request)
            ?? throw new InvalidOperationException("TickerQ downgrade payload is invalid.");

        await _paddleService.DowngradePlanPriceAsync(payload.UserId, payload.OldPlanPrice, payload.NewPlanPrice);

        _logger.LogInformation(
            $"TickerQ downgrade task executed. JobId: {context.Id}, UserId: {payload.UserId}, OldPlanPrice: {payload.OldPlanPrice}, NewPlanPrice: {payload.NewPlanPrice}");
    }

    public sealed class PlanDowngradePayload
    {
        public Guid UserId { get; set; }
        public string OldPlanPrice { get; set; } = string.Empty;
        public string NewPlanPrice { get; set; } = string.Empty;
    }
}