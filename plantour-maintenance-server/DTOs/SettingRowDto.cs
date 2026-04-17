namespace plantour_maintenance_server.DTOs;

public sealed class SettingRowDto
{
    public string Key { get; set; } = string.Empty;

    public string Value { get; set; } = string.Empty;

    public string ValueType { get; set; } = string.Empty;

    public string? Notes { get; set; }

    public DateTime UpdatedAt { get; set; }
}