using System.Text.Json.Serialization;

namespace plantour_server.DTOs;

public class AIItemDto
{
    [JsonPropertyName("category")]
    public string Category { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("units")]
    public string Units { get; set; } = string.Empty;
    [JsonPropertyName("value")]
    public decimal Value { get; set; }

    [JsonPropertyName("notes")]
    public string Notes { get; set; } = string.Empty;
}
