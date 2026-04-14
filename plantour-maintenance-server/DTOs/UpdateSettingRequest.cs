namespace plantour_maintenance_server.DTOs;

public sealed class UpdateSettingRequest
{
    public string Value { get; set; } = string.Empty;

    public string ValueType { get; set; } = string.Empty;

    public string? Notes { get; set; }
}