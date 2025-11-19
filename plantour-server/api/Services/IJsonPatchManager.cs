using System.Collections.Generic;
using System.Text.Json.Nodes;
using Plantour.Infrastructure.Dtos;

namespace Plantour.Services;

public interface IJsonPatchManager
{
    JsonNode ApplyPatch(JsonNode root, IReadOnlyCollection<JsonPatchOperation> operations);
}
