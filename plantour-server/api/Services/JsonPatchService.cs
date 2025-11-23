using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Plantour.Models;

namespace Plantour.Services;

public enum JsonPatchApplyResultCode
{
    Success = 0,
    InvalidEntity = 1,
    NotFound = 2,
    VersionMismatch = 3,
    InvalidPatch = 4,
    JsonError = 5,
    DatabaseError = 6,
    UnknownError = 99
}

public sealed class JsonPatchApplyResult
{
    public JsonPatchApplyResultCode Code { get; init; }
    public string? Message { get; init; }
    public int? NewVersion { get; init; }
    public JsonNode? NewData { get; init; }

    public bool IsSuccess => Code == JsonPatchApplyResultCode.Success;

    public static JsonPatchApplyResult Success(JsonNode data, int newVersion) =>
        new()
        {
            Code = JsonPatchApplyResultCode.Success,
            NewData = data,
            NewVersion = newVersion
        };

    public static JsonPatchApplyResult Failure(JsonPatchApplyResultCode code, string? message = null) =>
        new()
        {
            Code = code,
            Message = message
        };
}

public sealed class JsonPatchOperation
{
    public string Op { get; set; } = default!;
    public string Path { get; set; } = default!;
    public JsonNode? Value { get; set; }
}

public sealed class JsonPatchRequest
{
    public string Entity { get; set; } = default!;
    public Guid Id { get; set; }
    public int BaseVersion { get; set; }
    public List<JsonPatchOperation> Operations { get; set; } = new();
}

public interface IJsonPatchService
{
    Task<JsonPatchApplyResult> ApplyPatchAsync(JsonPatchRequest req, CancellationToken ct = default);
}

public sealed class JsonPatchService : IJsonPatchService
{
    private readonly PlantourContext _db;
    private readonly JsonSerializerOptions _jsonOptions;

    private readonly IReadOnlyDictionary<string, string> _entityToTable =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "tour", "plantour.tours" }
        };

    public JsonPatchService(PlantourContext db)
    {
        _db = db;

        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    public async Task<JsonPatchApplyResult> ApplyPatchAsync(JsonPatchRequest req, CancellationToken ct = default)
    {
        if (!_entityToTable.TryGetValue(req.Entity, out var table))
        {
            return JsonPatchApplyResult.Failure(JsonPatchApplyResultCode.InvalidEntity, "Unknown entity.");
        }

        try
        {
            await using var conn = (NpgsqlConnection)_db.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open)
                await conn.OpenAsync(ct);

            // 1. Загружаем строку
            var selectCmd = conn.CreateCommand();
            selectCmd.CommandText = $@"
                SELECT json_object, version, active
                FROM {table}
                WHERE id = @id";
            selectCmd.Parameters.AddWithValue("id", req.Id);

            string? oldJson = null;
            int? version = null;
            bool isActive = true;

            await using (var reader = await selectCmd.ExecuteReaderAsync(ct))
            {
                if (await reader.ReadAsync(ct))
                {
                    object raw = reader.GetValue(0);

                    oldJson = raw switch
                    {
                        string s => s,
                        byte[] bytes => System.Text.Encoding.UTF8.GetString(bytes),
                        _ => raw.ToString() ?? throw new Exception("Cannot convert json_object to text")
                    };

                    version = reader.GetInt32(1);
                    isActive = reader.GetBoolean(2);
                }
                else
                {
                    return JsonPatchApplyResult.Failure(JsonPatchApplyResultCode.NotFound);
                }
            }

            JsonNode root;
            try
            {
                using var doc = JsonDocument.Parse(oldJson!);
                root = JsonNode.Parse(doc.RootElement.GetRawText())!;
            }
            catch (Exception ex)
            {
                return JsonPatchApplyResult.Failure(JsonPatchApplyResultCode.JsonError, ex.Message);
            }

            // 2. Если объект не активен — патч НЕ применяется, но это не ошибка
            if (!isActive)
            {
                return JsonPatchApplyResult.Success(root, version ?? 0);
            }

            // 3. Применяем патчи best-effort: ошибки отдельных операций игнорируются
            ApplyPatchOps(root, req.Operations);

            string newJson = root.ToJsonString(_jsonOptions);

            // 4. Записываем обратно, версию просто инкрементим
            var updateCmd = conn.CreateCommand();
            updateCmd.CommandText = $@"
                UPDATE {table}
                SET json_object = @json::jsonb,
                    version = version + 1
                WHERE id = @id
                  AND active = TRUE
                RETURNING version;
            ";
            updateCmd.Parameters.AddWithValue("json", newJson);
            updateCmd.Parameters.AddWithValue("id", req.Id);

            int? newVersion = null;

            await using (var reader = await updateCmd.ExecuteReaderAsync(ct))
            {
                if (await reader.ReadAsync(ct))
                    newVersion = reader.GetInt32(0);
            }

            // Если строка стала неактивной/удалена между SELECT и UPDATE –
            // считаем патч не применённым и возвращаем старое состояние без ошибки.
            if (newVersion == null)
            {
                return JsonPatchApplyResult.Success(root, version ?? 0);
            }

            JsonNode newData;
            try
            {
                using var doc2 = JsonDocument.Parse(newJson);
                newData = JsonNode.Parse(doc2.RootElement.GetRawText())!;
            }
            catch (Exception ex)
            {
                return JsonPatchApplyResult.Failure(JsonPatchApplyResultCode.JsonError, ex.Message);
            }

            return JsonPatchApplyResult.Success(newData, newVersion.Value);
        }
        catch (Exception ex)
        {
            return JsonPatchApplyResult.Failure(JsonPatchApplyResultCode.UnknownError, ex.Message);
        }
    }

    // ============================================================
    // JSON PATCH
    // ============================================================

    private static void ApplyPatchOps(JsonNode root, IReadOnlyList<JsonPatchOperation> ops)
    {
        foreach (var op in ops)
        {
            try
            {
                var opName = op.Op?.ToLowerInvariant();

                switch (opName)
                {
                    case "add":
                        ApplyAdd(root, op.Path, op.Value);
                        break;
                    case "remove":
                        ApplyRemove(root, op.Path);
                        break;
                    case "replace":
                        ApplyReplace(root, op.Path, op.Value);
                        break;
                    default:
                        // Неизвестные операции игнорируем (no-op)
                        break;
                }
            }
            catch
            {
                // Любые ошибки внутри операции игнорируем — патч всегда "правильный"
            }
        }
    }

    private static void ApplyAdd(JsonNode root, string path, JsonNode? value)
    {
        if (!TryParsePath(path, out var tokens) || tokens.Count == 0)
            return;

        JsonNode? val = value ?? JsonValue.Create((object?)null);

        var (parent, lastToken) = ResolveParentForAdd(root, tokens);

        if (parent is JsonObject obj)
        {
            // Вариант с фильтром по ID в последнем сегменте: /items[id=abc]
            if (TryParsePropertyWithFilter(lastToken, out var propName, out var filterKey, out var filterValue) &&
                filterKey != null && filterValue != null)
            {
                var arrNode = obj[propName] as JsonArray;
                if (arrNode == null)
                {
                    arrNode = new JsonArray();
                    obj[propName] = arrNode;
                }

                // Добавляем/обновляем элемент с таким ID
                var element = FindOrCreateElementByFilter(arrNode, filterKey, filterValue, createIfMissing: true);
                if (element != null)
                {
                    // Если значение – объект, заменяем целиком,
                    // иначе кладём в специальное поле "value" (при желании можно изменить стратегию)
                    if (val is JsonObject valObj)
                    {
                        // очищаем и копируем свойства
                        element.Clear();
                        foreach (var kvp in valObj)
                        {
                            element[kvp.Key] = kvp.Value;
                        }

                        // гарантируем наличие ID
                        if (!element.ContainsKey(filterKey))
                            element[filterKey] = filterValue;
                    }
                    else
                    {
                        element["value"] = val;
                        if (!element.ContainsKey(filterKey))
                            element[filterKey] = filterValue;
                    }
                }

                return;
            }

            // Обычное свойство объекта
            obj[lastToken] = val;
            return;
        }

        if (parent is JsonArray arr)
        {
            ApplyToArrayAdd(arr, lastToken, val);
        }
    }

    private static void ApplyRemove(JsonNode root, string path)
    {
        if (!TryParsePath(path, out var tokens) || tokens.Count == 0)
            return;

        if (!TryResolveParent(root, tokens, out var parent, out var lastToken))
        {
            // Не можем разыменовать путь – no-op
            return;
        }

        if (parent is JsonObject obj)
        {
            // Удаление элемента массива по ID: /items[id=abc]
            if (TryParsePropertyWithFilter(lastToken, out var propName, out var filterKey, out var filterValue) &&
                filterKey != null && filterValue != null)
            {
                var arrNode = obj[propName] as JsonArray;
                if (arrNode != null)
                {
                    RemoveFirstByFilter(arrNode, filterKey, filterValue);
                }
                return;
            }

            obj.Remove(lastToken);
            return;
        }

        if (parent is JsonArray arr)
        {
            if (int.TryParse(lastToken, out var index))
            {
                if (index >= 0 && index < arr.Count)
                {
                    arr.RemoveAt(index);
                }
            }
        }
    }

    private static void ApplyReplace(JsonNode root, string path, JsonNode? value)
    {
        if (!TryParsePath(path, out var tokens) || tokens.Count == 0)
            return;

        JsonNode? val = value ?? JsonValue.Create((object?)null);

        if (!TryResolveParent(root, tokens, out var parent, out var lastToken))
        {
            // Не нашли родителя – попробуем вести себя как add (upsert)
            var (addParent, addLastToken) = ResolveParentForAdd(root, tokens);

            if (addParent is JsonObject addObj)
            {
                if (TryParsePropertyWithFilter(addLastToken, out var propName, out var filterKey, out var filterValue) &&
                    filterKey != null && filterValue != null)
                {
                    var arrNode = addObj[propName] as JsonArray;
                    if (arrNode == null)
                    {
                        arrNode = new JsonArray();
                        addObj[propName] = arrNode;
                    }

                    var element = FindOrCreateElementByFilter(arrNode, filterKey, filterValue, createIfMissing: true);
                    if (element != null)
                    {
                        if (val is JsonObject valObj)
                        {
                            element.Clear();
                            foreach (var kvp in valObj)
                            {
                                element[kvp.Key] = kvp.Value;
                            }

                            if (!element.ContainsKey(filterKey))
                                element[filterKey] = filterValue;
                        }
                        else
                        {
                            element["value"] = val;
                            if (!element.ContainsKey(filterKey))
                                element[filterKey] = filterValue;
                        }
                    }

                    return;
                }

                addObj[addLastToken] = val;
                return;
            }

            if (addParent is JsonArray addArr)
            {
                ApplyToArrayAdd(addArr, addLastToken, val);
                return;
            }

            return;
        }

        if (parent is JsonObject obj)
        {
            // Replace по элементу массива через селектор: /items[id=abc]
            if (TryParsePropertyWithFilter(lastToken, out var propName, out var filterKey, out var filterValue) &&
                filterKey != null && filterValue != null)
            {
                var arrNode = obj[propName] as JsonArray;
                if (arrNode == null)
                {
                    arrNode = new JsonArray();
                    obj[propName] = arrNode;
                }

                var element = FindOrCreateElementByFilter(arrNode, filterKey, filterValue, createIfMissing: true);
                if (element != null)
                {
                    if (val is JsonObject valObj)
                    {
                        element.Clear();
                        foreach (var kvp in valObj)
                        {
                            element[kvp.Key] = kvp.Value;
                        }

                        if (!element.ContainsKey(filterKey))
                            element[filterKey] = filterValue;
                    }
                    else
                    {
                        element["value"] = val;
                        if (!element.ContainsKey(filterKey))
                            element[filterKey] = filterValue;
                    }
                }

                return;
            }

            // Обычное свойство
            obj[lastToken] = val;
            return;
        }

        if (parent is JsonArray arr)
        {
            if (lastToken == "-")
            {
                arr.Add(val);
                return;
            }

            if (int.TryParse(lastToken, out var index))
            {
                if (index >= 0 && index < arr.Count)
                {
                    arr[index] = val;
                }
                else
                {
                    // Позицию обеспечить нельзя — вставляем в конец
                    arr.Add(val);
                }
            }
            else
            {
                // Некорректный индекс — вставляем в конец
                arr.Add(val);
            }
        }
    }

    // ============================================================
    // PATH / RESOLUTION HELPERS
    // ============================================================

    private static bool TryParsePath(string path, out List<string> tokens)
    {
        tokens = new List<string>();

        if (string.IsNullOrWhiteSpace(path))
            return false;

        if (!path.StartsWith("/"))
            return false;

        var split = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
        tokens.AddRange(split);
        return true;
    }

    /// <summary>
    /// Парсит сегмент вида "items[id=123]" → propertyName="items", filterKey="id", filterValue="123".
    /// Если фильтра нет, возвращает propertyName=segment и filterKey/filterValue=null.
    /// </summary>
    private static bool TryParsePropertyWithFilter(string segment, out string propertyName, out string? filterKey, out string? filterValue)
    {
        propertyName = segment;
        filterKey = null;
        filterValue = null;

        int bracketStart = segment.IndexOf('[');
        int bracketEnd = segment.IndexOf(']', bracketStart + 1);

        if (bracketStart > 0 && bracketEnd > bracketStart)
        {
            propertyName = segment.Substring(0, bracketStart);
            var inside = segment.Substring(bracketStart + 1, bracketEnd - bracketStart - 1); // "id=123"
            var parts = inside.Split('=', 2, StringSplitOptions.TrimEntries);
            if (parts.Length == 2)
            {
                filterKey = parts[0];
                filterValue = parts[1];
                return true;
            }
        }

        return false;
    }

    private static (JsonNode parent, string lastToken) ResolveParentForAdd(JsonNode root, List<string> tokens)
    {
        JsonNode current = root;

        for (int i = 0; i < tokens.Count - 1; i++)
        {
            var token = tokens[i];

            if (current is JsonObject obj)
            {
                if (TryParsePropertyWithFilter(token, out var propName, out var filterKey, out var filterValue) &&
                    filterKey != null && filterValue != null)
                {
                    // propName должен быть массивом: obj[propName] → JsonArray
                    var arrNode = obj[propName] as JsonArray;
                    if (arrNode == null)
                    {
                        arrNode = new JsonArray();
                        obj[propName] = arrNode;
                    }

                    var element = FindOrCreateElementByFilter(arrNode, filterKey, filterValue, createIfMissing: true);

                    JsonNode next;
                    if (element != null)
                        next = element;     // JsonObject
                    else
                        next = arrNode;     // JsonArray

                    current = next;
                }
                else
                {
                    if (obj[propName] == null)
                    {
                        // если следующий сегмент похож на индекс массива – создаём массив, иначе объект
                        if (i + 1 < tokens.Count && int.TryParse(tokens[i + 1], out _))
                        {
                            var newArray = new JsonArray();
                            obj[propName] = newArray;
                            current = newArray;
                        }
                        else
                        {
                            var newObj = new JsonObject();
                            obj[propName] = newObj;
                            current = newObj;
                        }
                    }
                    else
                    {
                        current = obj[propName]!;
                    }
                }
            }
            else if (current is JsonArray arr)
            {
                var t = token;
                if (int.TryParse(t, out var index))
                {
                    if (index < 0)
                        index = 0;

                    if (index >= arr.Count)
                    {
                        while (arr.Count <= index)
                        {
                            arr.Add(new JsonObject());
                        }
                    }

                    current = arr[index]!;
                }
                else
                {
                    // Некорректный индекс – прекращаем детализацию, дальше работать не с чем
                    return (current, tokens[^1]);
                }
            }
            else
            {
                // Не объект и не массив – заменяем на объект
                var newObj = new JsonObject();
                current = newObj;
            }
        }

        return (current, tokens[^1]);
    }

    private static bool TryResolveParent(JsonNode root, List<string> tokens, out JsonNode parent, out string lastToken)
    {
        parent = root;
        lastToken = tokens[^1];

        JsonNode current = root;

        for (int i = 0; i < tokens.Count - 1; i++)
        {
            var token = tokens[i];

            if (current is JsonObject obj)
            {
                if (TryParsePropertyWithFilter(token, out var propName, out var filterKey, out var filterValue) &&
                    filterKey != null && filterValue != null)
                {
                    var arrNode = obj[propName] as JsonArray;
                    if (arrNode == null)
                        return false;

                    var element = FindFirstByFilter(arrNode, filterKey, filterValue);
                    if (element == null)
                        return false;

                    current = element;
                }
                else
                {
                    if (obj[propName] == null)
                        return false;

                    current = obj[propName]!;
                }
            }
            else if (current is JsonArray arr)
            {
                var t = token;
                if (!int.TryParse(t, out var index))
                    return false;

                if (index < 0 || index >= arr.Count)
                    return false;

                current = arr[index]!;
            }
            else
            {
                return false;
            }
        }

        parent = current;
        return true;
    }

    private static void ApplyToArrayAdd(JsonArray arr, string indexToken, JsonNode? value)
    {
        if (indexToken == "-")
        {
            arr.Add(value);
            return;
        }

        if (int.TryParse(indexToken, out var index))
        {
            if (index < 0)
            {
                arr.Insert(0, value);
            }
            else if (index <= arr.Count)
            {
                arr.Insert(index, value);
            }
            else
            {
                arr.Add(value);
            }
        }
        else
        {
            arr.Add(value);
        }
    }

    // ============================================================
    // ARRAY FILTER HELPERS (ID-ориентированная модель)
    // ============================================================

    private static JsonObject? FindFirstByFilter(JsonArray arr, string filterKey, string filterValue)
    {
        foreach (var node in arr)
        {
            if (node is JsonObject obj)
            {
                var v = obj[filterKey]?.ToString();
                if (string.Equals(v, filterValue, StringComparison.Ordinal))
                    return obj;
            }
        }

        return null;
    }

    private static JsonObject? FindOrCreateElementByFilter(JsonArray arr, string filterKey, string filterValue, bool createIfMissing)
    {
        var existing = FindFirstByFilter(arr, filterKey, filterValue);
        if (existing != null)
            return existing;

        if (!createIfMissing)
            return null;

        var newObj = new JsonObject
        {
            [filterKey] = filterValue
        };

        arr.Add(newObj);
        return newObj;
    }

    private static void RemoveFirstByFilter(JsonArray arr, string filterKey, string filterValue)
    {
        for (int i = 0; i < arr.Count; i++)
        {
            if (arr[i] is JsonObject obj)
            {
                var v = obj[filterKey]?.ToString();
                if (string.Equals(v, filterValue, StringComparison.Ordinal))
                {
                    arr.RemoveAt(i);
                    return;
                }
            }
        }
    }
}
