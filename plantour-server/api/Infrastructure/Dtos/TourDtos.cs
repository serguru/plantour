using System.Text.Json;
using System;
using System.Collections.Generic;


namespace Plantour.Infrastructure.Dtos;

// Для создания тура
public class CreateTourRequest
{
    public string Name { get; set; } = null!;
    public string Status { get; set; } = "draft";
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }

    // Произвольный объект тура
    public JsonElement TourData { get; set; }
}

// Для ответа клиенту
public class TourResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public int Version { get; set; }
    public JsonElement TourData { get; set; }
}

// Операция патча (похоже на JSON Patch RFC 6902, но упрощено)
public class JsonPatchOperation
{
    /// <summary>
    /// Тип операции: "add" | "remove" | "replace"
    /// </summary>
    public string Op { get; set; } = null!;

    /// <summary>
    /// Путь в формате JSON Pointer, например: "/title", "/days/0/city"
    /// </summary>
    public string Path { get; set; } = null!;

    /// <summary>
    /// Значение для операций add/replace
    /// </summary>
    public JsonElement? Value { get; set; }
}

// Запрос патча для конкретного тура
public class ApplyTourPatchRequest
{
    public int ExpectedVersion { get; set; }
    public List<JsonPatchOperation> Operations { get; set; } = new();
}
