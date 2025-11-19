using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Nodes;
using Plantour.Infrastructure.Dtos;


//Ограничения:
//– не реализованы спец-правила JSON Pointer (~0, ~1, - для добавления в конец массива и т.д.)
//– но для тестов и простого использования достаточно.

namespace Plantour.Services;

public class JsonPatchManager : IJsonPatchManager
{
    public JsonNode ApplyPatch(JsonNode root, IReadOnlyCollection<JsonPatchOperation> operations)
    {
        if (root is null)
        {
            root = new JsonObject();
        }

        foreach (var op in operations)
        {
            ApplySingle(root, op);
        }

        return root;
    }

    private void ApplySingle(JsonNode root, JsonPatchOperation op)
    {
        if (string.IsNullOrWhiteSpace(op.Path) || !op.Path.StartsWith("/"))
            throw new InvalidOperationException($"Invalid path '{op.Path}'.");

        var segments = op.Path.Split('/', StringSplitOptions.RemoveEmptyEntries);

        var (parent, lastSegment) = TraverseToParent(root, segments);

        switch (op.Op.ToLowerInvariant())
        {
            case "add":
            case "replace":
                if (op.Value is null)
                    throw new InvalidOperationException($"Operation '{op.Op}' requires 'value'.");

                ApplyAddOrReplace(parent, lastSegment, op.Value.Value);
                break;

            case "remove":
                ApplyRemove(parent, lastSegment);
                break;

            default:
                throw new InvalidOperationException($"Unsupported operation '{op.Op}'.");
        }
    }

    private static (JsonNode parent, string lastSegment) TraverseToParent(JsonNode root, string[] segments)
    {
        if (segments.Length == 0)
            throw new InvalidOperationException("Path must contain at least one segment.");

        var current = root;
        for (int i = 0; i < segments.Length - 1; i++)
        {
            var segment = segments[i];
            if (current is JsonObject obj)
            {
                current = obj[segment] ?? (obj[segment] = new JsonObject());
            }
            else if (current is JsonArray arr && int.TryParse(segment, NumberStyles.None, CultureInfo.InvariantCulture, out var idx))
            {
                EnsureArraySize(arr, idx + 1);
                current = arr[idx] ?? (arr[idx] = new JsonObject());
            }
            else
            {
                throw new InvalidOperationException($"Cannot traverse segment '{segment}'.");
            }
        }

        return (current, segments[^1]);
    }

    private static void ApplyAddOrReplace(JsonNode parent, string segment, JsonElement value)
    {
        var nodeToSet = JsonNode.Parse(value.GetRawText());

        if (parent is JsonObject obj)
        {
            obj[segment] = nodeToSet;
        }
        else if (parent is JsonArray arr)
        {
            if (!int.TryParse(segment, NumberStyles.None, CultureInfo.InvariantCulture, out var idx))
                throw new InvalidOperationException($"Array index expected, got '{segment}'.");

            EnsureArraySize(arr, idx + 1);
            arr[idx] = nodeToSet;
        }
        else
        {
            throw new InvalidOperationException("Parent is neither object nor array.");
        }
    }

    private static void ApplyRemove(JsonNode parent, string segment)
    {
        if (parent is JsonObject obj)
        {
            obj.Remove(segment);
        }
        else if (parent is JsonArray arr)
        {
            if (!int.TryParse(segment, NumberStyles.None, CultureInfo.InvariantCulture, out var idx))
                throw new InvalidOperationException($"Array index expected, got '{segment}'.");

            if (idx < 0 || idx >= arr.Count)
                return; // нет – и ладно

            arr.RemoveAt(idx);
        }
        else
        {
            throw new InvalidOperationException("Parent is neither object nor array.");
        }
    }

    private static void EnsureArraySize(JsonArray arr, int size)
    {
        while (arr.Count < size)
        {
            arr.Add(null);
        }
    }
}
