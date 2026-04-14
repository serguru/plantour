using plantour_server.Services;

namespace plantour_server.Logging;

public sealed class PlantourLoggerSettingsStore(IServiceScopeFactory serviceScopeFactory)
{
    private readonly IServiceScopeFactory _serviceScopeFactory = serviceScopeFactory;
    private PlantourLoggerOptions _current = new();

    public PlantourLoggerOptions Current => _current;

    public async Task RefreshAsync(CancellationToken cancellationToken = default)
    {
        using var scope = _serviceScopeFactory.CreateScope();
        var serverSettingsService = scope.ServiceProvider.GetRequiredService<ServerSettingsService>();
        _current = await serverSettingsService.GetPlantourLoggerOptionsAsync();
    }
}