using plantour_maintenance_server.DTOs;

namespace plantour_maintenance_server.Services.Interfaces;

public interface ISettingsService
{
    Task<IReadOnlyList<SettingRowDto>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<SettingRowDto> UpdateAsync(string key, UpdateSettingRequest request, CancellationToken cancellationToken = default);
}