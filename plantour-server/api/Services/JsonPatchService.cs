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

/// <summary>
/// Result codes for JSON patch application.
/// </summary>
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

/// <summary>
/// Universal JSON Patch Service for ANY table with:
///   id UUID
///   json_object JSONB
///   version INT
/// </summary>
public interface IJsonPatchService
{
    Task<JsonPatchApplyResult> ApplyPatchAsync(JsonPatchRequest req, CancellationToken ct = default);
}

public sealed class JsonPatchService : IJsonPatchService
{
    private readonly PlantourContext _db;
    private readonly JsonSerializerOptions _jsonOptions;
    private readonly IReadOnlyDictionary<string, string> _entityToTable = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        { "tour", "tours" }
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
            return JsonPatchApplyResult.Failure(JsonPatchApplyResultCode.InvalidEntity, "Unknown entity.");

        try
        {
            await using var conn = (NpgsqlConnection)_db.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open)
                await conn.OpenAsync(ct);

            // ======================
            // 1. SELECT existing row
            // ======================
            var selectCmd = conn.CreateCommand();
            selectCmd.CommandText = $@"
SELECT json_object, version
FROM {table}
WHERE id = @id;
";
            selectCmd.Parameters.AddWithValue("id", req.Id);

            string? oldJson = null;
            int? version = null;

            await using (var reader = await selectCmd.ExecuteReaderAsync(ct))
            {
                if (await reader.ReadAsync(ct))
                {
                    // json_object may be string, byte[], text, jsonb
                    object raw = reader.GetValue(0);

                    oldJson = raw switch
                    {
                        string s => s,
                        byte[] bytes => System.Text.Encoding.UTF8.GetString(bytes),
                        _ => raw.ToString() ?? throw new Exception("Cannot convert json_object to text.")
                    };

                    version = reader.GetInt32(1);
                }
                else
                {
                    return JsonPatchApplyResult.Failure(JsonPatchApplyResultCode.NotFound);
                }
            }

            if (version != req.BaseVersion)
                return JsonPatchApplyResult.Failure(JsonPatchApplyResultCode.VersionMismatch);

            // ======================
            // 2. Parse old JSON
            // ======================
            //JsonNode root;
            //try
            //{
            //    root = JsonNode.Parse(oldJson!, _jsonOptions)!;
            //}
            //catch (Exception ex)
            //{
            //    return JsonPatchApplyResult.Failure(JsonPatchApplyResultCode.JsonError, ex.Message);
            //}


            JsonNode root;
            try
            {
                // Parse JSON universally (works regardless of runtime)
                using var doc = JsonDocument.Parse(oldJson!);
                root = JsonNode.Parse(doc.RootElement.GetRawText())!;
            }
            catch (Exception ex)
            {
                return JsonPatchApplyResult.Failure(JsonPatchApplyResultCode.JsonError, ex.Message);
            }


            // ======================
            // 3. Apply patch ops
            // ======================
            try
            {
                ApplyPatchOps(root, req.Operations);
            }
            catch (Exception ex)
            {
                return JsonPatchApplyResult.Failure(JsonPatchApplyResultCode.InvalidPatch, ex.Message);
            }

            string newJson = root.ToJsonString(_jsonOptions);

            // ======================
            // 4. OCC UPDATE
            // ======================
            var updateCmd = conn.CreateCommand();
            updateCmd.CommandText = $@"
UPDATE {table}
SET json_object = @json::jsonb,
    version = version + 1
WHERE id = @id
  AND version = @baseVersion
RETURNING version;
";
            updateCmd.Parameters.AddWithValue("json", newJson);
            updateCmd.Parameters.AddWithValue("id", req.Id);
            updateCmd.Parameters.AddWithValue("baseVersion", req.BaseVersion);

            int? newVersion = null;

            await using (var reader = await updateCmd.ExecuteReaderAsync(ct))
            {
                if (await reader.ReadAsync(ct))
                    newVersion = reader.GetInt32(0);
            }

            if (newVersion == null)
                return JsonPatchApplyResult.Failure(JsonPatchApplyResultCode.VersionMismatch);

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
    // JSON PATCH LOGIC
    // ============================================================

    private static void ApplyPatchOps(JsonNode root, IReadOnlyList<JsonPatchOperation> ops)
    {
        foreach (var op in ops)
        {
            switch (op.Op.ToLowerInvariant())
            {
                case "add": ApplyAdd(root, op.Path, op.Value); break;
                case "remove": ApplyRemove(root, op.Path); break;
                case "replace": ApplyReplace(root, op.Path, op.Value); break;
                default:
                    throw new NotSupportedException($"Unsupported op '{op.Op}'");
            }
        }
    }

    private static void ApplyAdd(JsonNode root, string path, JsonNode? value)
    {
        if (value == null) throw new Exception("Value required.");
        var (parent, token) = ResolveParent(root, path);

        if (parent is JsonObject o)
            o[token] = value;

        else if (parent is JsonArray a)
        {
            if (token == "-") a.Add(value);
            else a.Insert(int.Parse(token), value);
        }
        else throw new Exception("Invalid target for add.");
    }

    private static void ApplyRemove(JsonNode root, string path)
    {
        var (parent, token) = ResolveParent(root, path);

        if (parent is JsonObject o)
            o.Remove(token);
        else if (parent is JsonArray a)
            a.RemoveAt(int.Parse(token));
        else throw new Exception("Invalid target for remove.");
    }

    private static void ApplyReplace(JsonNode root, string path, JsonNode? value)
    {
        if (value == null) throw new Exception("Value required.");
        var (parent, token) = ResolveParent(root, path);

        if (parent is JsonObject o)
            o[token] = value;
        else if (parent is JsonArray a)
            a[int.Parse(token)] = value;
        else throw new Exception("Invalid target for replace.");
    }

    private static (JsonNode parent, string token) ResolveParent(JsonNode root, string path)
    {
        if (!path.StartsWith("/"))
            throw new Exception("Path must start with '/'.");

        var tokens = path.Split('/', StringSplitOptions.RemoveEmptyEntries);

        JsonNode cur = root;

        for (int i = 0; i < tokens.Length - 1; i++)
        {
            var t = tokens[i];
            cur = cur switch
            {
                JsonObject o => o[t]!,
                JsonArray a => a[int.Parse(t)]!,
                _ => throw new Exception($"Cannot traverse '{t}'.")
            };
        }

        return (cur, tokens[^1]);
    }
}
