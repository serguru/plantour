using plantour.Infrastructure.Dtos;
using Plantour.Models;
using System.Text.Json;

namespace Plantour.Services;

public interface ITourService
{
    Task<TourResponseDto?> GetTourAsync(Guid id);
    Task<List<TourResponseDto>> GetAllToursAsync();
    Task<TourResponseDto> CreateTourAsync(TourCreateDto dto);
    Task<TourResponseDto?> ApplyPatchAsync(JsonPatchRequest req);
    Task<bool> DeleteAsync(Guid id);
}

public class TourService : ITourService
{
    private readonly ITourRepository _repo;
    private readonly IJsonPatchService _patch;

    public TourService(ITourRepository repo, IJsonPatchService patch)
    {
        _repo = repo;
        _patch = patch;
    }

    public async Task<TourResponseDto?> GetTourAsync(Guid id)
    {
        var entity = await _repo.GetAsync(id);
        if (entity == null)
            return null;

        var obj = JsonSerializer.Deserialize<TourJsonModel>(entity.JsonObject);
        if (obj == null)
            return null;

        return new TourResponseDto
        {
            Id = obj.Id,
            Name = obj.Name,
            Json = entity.JsonObject
        };
    }

    public async Task<List<TourResponseDto>> GetAllToursAsync()
    {
        var list = await _repo.GetAllAsync();

        var result = new List<TourResponseDto>();

        foreach (var entity in list)
        {
            var obj = JsonSerializer.Deserialize<TourJsonModel>(entity.JsonObject);
            if (obj == null)
                continue;

            result.Add(new TourResponseDto
            {
                Id = obj.Id,
                Name = obj.Name,
                Json = entity.JsonObject
            });
        }

        return result;
    }

    public async Task<TourResponseDto> CreateTourAsync(TourCreateDto dto)
    {
        var model = new TourJsonModel
        {
            Id = Guid.NewGuid(),
            Name = dto.Name
        };

        string json = JsonSerializer.Serialize(model);

        var saved = await _repo.AddAsync(json);

        return new TourResponseDto
        {
            Id = model.Id,
            Name = model.Name,
            Json = saved.JsonObject
        };
    }

    public async Task<TourResponseDto?> ApplyPatchAsync(JsonPatchRequest req)
    {
        // 1. Указываем сущность (таблицу)
        req.Entity = "tour";

        // 2. Делаем вызов JsonPatchService
        var result = await _patch.ApplyPatchAsync(req);

        // 3. Если не удалось — вернуть null / ошибка
        if (!result.IsSuccess || result.NewData == null)
            return null;

        // 4. Преобразуем результат JSON → TourJsonModel
        var model = result.NewData.Deserialize<TourJsonModel>();
        if (model == null)
            return null;

        // 5. Возвращаем DTO
        return new TourResponseDto
        {
            Id = model.Id,
            Name = model.Name,
            Json = result.NewData.ToJsonString(),
            Version = result.NewVersion!.Value
        };
    }


    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _repo.GetAsync(id);
        if (entity == null)
            return false;

        await _repo.DeleteAsync(entity);
        return true;
    }
}
