using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;
using plantour_maintenance_server.DTOs;
using plantour_maintenance_server.Middleware;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Services;

public sealed class SettingsService(PlantourContext context) : ISettingsService
{
    private static readonly HashSet<string> AllowedValueTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "string",
        "integer",
        "boolean"
    };

    private readonly PlantourContext _context = context;

    public async Task<IReadOnlyList<SettingRowDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Settings
            .AsNoTracking()
            .OrderBy(setting => setting.Key)
            .Select(ToDto())
            .ToListAsync(cancellationToken);
    }

    public async Task<SettingRowDto> UpdateAsync(string key, UpdateSettingRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            throw new BadRequestException("Setting key is required.", "SETTING_KEY_REQUIRED");
        }

        var normalizedValueType = NormalizeValueType(request.ValueType);
        ValidateValue(request.Value, normalizedValueType);

        var setting = await _context.Settings
            .SingleOrDefaultAsync(item => item.Key == key, cancellationToken);

        if (setting is null)
        {
            throw new NotFoundException($"Setting '{key}' was not found.", "SETTING_NOT_FOUND");
        }

        setting.Value = request.Value;
        setting.ValueType = normalizedValueType;
        setting.Notes = NormalizeNotes(request.Notes);
        setting.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return MapSetting(setting);
    }

    private static Expression<Func<Setting, SettingRowDto>> ToDto()
    {
        return setting => new SettingRowDto
        {
            Key = setting.Key,
            Value = setting.Value,
            ValueType = setting.ValueType,
            Notes = setting.Notes,
            UpdatedAt = setting.UpdatedAt
        };
    }

    private static SettingRowDto MapSetting(Setting setting)
    {
        return new SettingRowDto
        {
            Key = setting.Key,
            Value = setting.Value,
            ValueType = setting.ValueType,
            Notes = setting.Notes,
            UpdatedAt = setting.UpdatedAt
        };
    }

    private static string NormalizeValueType(string? valueType)
    {
        var normalizedValueType = valueType?.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(normalizedValueType) || !AllowedValueTypes.Contains(normalizedValueType))
        {
            throw new BadRequestException(
                "Value type must be one of: string, integer, boolean.",
                "SETTING_VALUE_TYPE_INVALID");
        }

        return normalizedValueType;
    }

    private static void ValidateValue(string? value, string valueType)
    {
        if (value is null)
        {
            throw new BadRequestException("Setting value is required.", "SETTING_VALUE_REQUIRED");
        }

        if (valueType == "integer" && !long.TryParse(value, out _))
        {
            throw new BadRequestException(
                "Integer settings must contain a whole number.",
                "SETTING_VALUE_INVALID");
        }

        if (valueType == "boolean" && !bool.TryParse(value, out _))
        {
            throw new BadRequestException(
                "Boolean settings must contain true or false.",
                "SETTING_VALUE_INVALID");
        }
    }

    private static string? NormalizeNotes(string? notes)
    {
        return string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
    }
}