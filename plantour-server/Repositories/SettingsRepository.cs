using AutoMapper;
using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Repositories;

public class SettingsRepository(PlantourContext context) : GenericRepository<Setting>(context)
{

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

    public async Task<Object> GetSettingByKey(string key)
    {
        var setting = await _dbSet.FirstOrDefaultAsync(s => s.Key == key);
        if (setting == null)
        {
            throw new NotFoundException($"Setting with key '{key}' not found");
        }

        return setting.ValueType switch
        {
            "integer" => StrToInt(setting.Value),
            "boolean" => StrToBool(setting.Value),
            "string" => setting.Value,
            _ => throw new CustomException($"Unsupported setting type '{setting.ValueType}' for key '{key}'")
        };
    }
}
