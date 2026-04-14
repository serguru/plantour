using Microsoft.AspNetCore.Mvc;
using plantour_maintenance_server.DTOs;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Controllers;

[ApiController]
[Route("settings")]
public class SettingsController(ISettingsService settingsService) : ControllerBase
{
    private readonly ISettingsService _settingsService = settingsService;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SettingRowDto>>> GetAll(CancellationToken cancellationToken)
    {
        var settings = await _settingsService.GetAllAsync(cancellationToken);
        return Ok(settings);
    }

    [HttpPut("{key}")]
    public async Task<ActionResult<SettingRowDto>> Update(
        string key,
        [FromBody] UpdateSettingRequest request,
        CancellationToken cancellationToken)
    {
        var setting = await _settingsService.UpdateAsync(key, request, cancellationToken);
        return Ok(setting);
    }
}