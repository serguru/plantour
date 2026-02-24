using AutoMapper;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Repositories;

public class SettingsRepository(PlantourContext context, HybridCache cache) : GenericRepository<Setting>(context)
{
    private const string AllSettingsCacheKey = "settings:all:v1";
    private const string SettingByKeyCacheKeyPrefix = "settings:by-key:v1:";

    private static readonly HybridCacheEntryOptions SettingEntryOptions = new()
    {
        Expiration = TimeSpan.FromMinutes(30),
        LocalCacheExpiration = TimeSpan.FromMinutes(10)
    };

    private readonly HybridCache _cache = cache;

    private sealed class SettingCacheItem
    {
        public required string ValueType { get; init; }
        public required string Value { get; init; }
    }


    private int StrToInt(string value)
    {
        if (!int.TryParse(value, out int result))
        {
            throw new CustomException("Wrong integer value in settings DB table");
        }

        return result;
    }

    private bool StrToBool(string value)
    {
        if (!bool.TryParse(value, out bool result))
        {
            throw new CustomException("Wrong boolean value in settings DB table");
        }

        return result;
    }

    private async Task<Dictionary<string, SettingCacheItem>> GetAllSettingsSnapshotAsync(CancellationToken cancellationToken = default)
    {
        return await _cache.GetOrCreateAsync(
            AllSettingsCacheKey,
            async cancel => await _dbSet
                .AsNoTracking()
                .Select(s => new
                {
                    s.Key,
                    s.ValueType,
                    s.Value
                })
                .ToDictionaryAsync(
                    x => x.Key,
                    x => new SettingCacheItem
                    {
                        ValueType = x.ValueType,
                        Value = x.Value
                    },
                    cancel),
            SettingEntryOptions,
            cancellationToken: cancellationToken);
    }

    private object ConvertSettingValue(string key, SettingCacheItem setting)
    {
        return setting.ValueType switch
        {
            "integer" => StrToInt(setting.Value),
            "boolean" => StrToBool(setting.Value),
            "string" => setting.Value,
            _ => throw new CustomException($"Unsupported setting type '{setting.ValueType}' for key '{key}'")
        };
    }

    public async Task<object> GetSettingByKey(string key)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            throw new CustomException("Setting key is required");
        }

        var allSettings = await GetAllSettingsSnapshotAsync();

        if (allSettings.TryGetValue(key, out var cachedSetting))
        {
            return ConvertSettingValue(key, cachedSetting);
        }

        var setting = await _cache.GetOrCreateAsync(
            $"{SettingByKeyCacheKeyPrefix}{key}",
            async cancel => await _dbSet
                .AsNoTracking()
                .Where(s => s.Key == key)
                .Select(s => new SettingCacheItem
                {
                    ValueType = s.ValueType,
                    Value = s.Value
                })
                .FirstOrDefaultAsync(cancel),
            SettingEntryOptions,
            cancellationToken: default);

        if (setting == null)
        {
            throw new CustomException($"Setting with key '{key}' not found");
        }

        return ConvertSettingValue(key, setting);
    }



}
