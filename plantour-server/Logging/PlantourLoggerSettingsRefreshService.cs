using Microsoft.Extensions.Hosting;
using plantour_server.Services;

namespace plantour_server.Logging;

public sealed class PlantourLoggerSettingsRefreshService(
    IServiceScopeFactory serviceScopeFactory,
    PlantourLoggerSettingsStore settingsStore) : BackgroundService
{
    private readonly IServiceScopeFactory _serviceScopeFactory = serviceScopeFactory;
    private readonly PlantourLoggerSettingsStore _settingsStore = settingsStore;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await _settingsStore.RefreshAsync(stoppingToken);
            }
            catch (Exception exception)
            {
                Console.Error.WriteLine($"[{DateTime.UtcNow:O}] [logger-settings-refresh-error] {exception}");
            }

            var delay = await GetRefreshDelayAsync(stoppingToken);

            try
            {
                await Task.Delay(delay, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }

    private async Task<TimeSpan> GetRefreshDelayAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var serverSettingsService = scope.ServiceProvider.GetRequiredService<ServerSettingsService>();
            var refreshIntervalMinutes = await serverSettingsService.GetCacheRefreshIntervalMinutesAsync();
            return TimeSpan.FromMinutes(refreshIntervalMinutes);
        }
        catch
        {
            return TimeSpan.FromMinutes(5);
        }
    }
}