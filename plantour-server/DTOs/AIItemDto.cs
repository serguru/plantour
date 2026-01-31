using System.Text.Json.Serialization;

namespace plantour_server.DTOs;

public class AIItemDto
{
    [JsonPropertyName("category")]
    public string Category { get; set; } = string.Empty;

    [JsonPropertyName("item_name")]
    public string ItemName { get; set; } = string.Empty;

    [JsonPropertyName("unit")]
    public string Unit { get; set; } = string.Empty;

    [JsonPropertyName("value")]
    public decimal Value { get; set; }

    [JsonPropertyName("recommendations")]
    public string Recommendations { get; set; } = string.Empty;
}
