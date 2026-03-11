using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;
using plantour_server.Models;
using PlantourApi.Middleware;
using System.Text.Json;

namespace plantour_server.Repositories;

public class UserSettingsRepository(PlantourContext context) : GenericRepository<UserSetting>(context)
{
    public async Task<UserSetting?> GetByKeyAsync(Guid userId, string key)
    {
        var settings = await FindAsync(x => x.UserId == userId && key.ToLower() == x.Key.ToLower());

        if (settings == null || !settings.Any())
        {
            return null;
        };
        
        return settings!.First();
    }

    public async Task<StartEndDates> SetUserEntitiesLogging(Guid userId, DateTime start, DateTime end)
    {
        var key = "entities-lLogging";
        StartEndDates value = new()
        {
            Start = start,
            End = end
        };
        await AddOrUpdateJson(userId, key, value, true);
        return value;
    }

    public async Task RemovetUserEntitiesLogging(Guid userId)
    {
        var key = "entities-lLogging";
        var result = await GetByKeyAsync(userId, key);
        if (result == null)
        {
            return;
        }
        await DeleteAsync(result.Id);
    }
    // TODO: it is necessary to clear outdated user entities loggings

    public async Task<StartEndDates?> GetUserEntitiesLogging(Guid userId)
    {
        var key = "entities-lLogging";
        var result = await GetJsonByKeyAsync<StartEndDates>(userId, key);
        return result;
    }

    public async Task<T?> GetJsonByKeyAsync<T>(Guid userId, string key)
    {
        var setting = await GetByKeyAsync(userId, key);
        if (setting == null || String.IsNullOrWhiteSpace(setting.Value))
        {
            return default;
        }

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        T? result = JsonSerializer.Deserialize<T>(setting.Value, options);

        return result;
    }

    public async Task SetActiveAsync(Guid userId, string key, bool active)
    {
        var setting = await GetByKeyAsync(userId, key);
        if (setting == null || setting.Active == active)
        {
            return;
        }
        setting.Active = active;
        await UpdateAsync(setting);
    }

    public async Task AddOrUpdateJson(Guid userId, string key, object value, bool active = false)
    {
        UserSetting? setting = await GetByKeyAsync(userId, key);

        bool isAdd = setting == null;

        if (isAdd)
        {
            setting = new UserSetting
            {
                UserId = userId,
                Key = key,
                ValueType = "json"
            };
        }

        if (setting!.ValueType.ToLower() != "json")
        {
            throw new CustomException($"User Id {userId} setting key {key} value type must be 'json'");
        }

        setting!.Active = active;
        setting.Value = JsonSerializer.Serialize(value);
        if (isAdd)
        {
            await AddAsync(setting);
            return;
        }
        await UpdateAsync(setting);
    }





}

