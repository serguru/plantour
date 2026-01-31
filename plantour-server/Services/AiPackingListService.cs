using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using plantour_server.DTOs;
using plantour_server.Models;
using PlantourApi.Middleware;

namespace plantour_server.Services;

public class AiPackingListService : IAiPackingListService
{
    private readonly HttpClient _httpClient;
    private readonly GeminiSettings _settings;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web);

    public AiPackingListService(HttpClient httpClient, IOptions<GeminiSettings> settings)
    {
        _httpClient = httpClient;
        _settings = settings.Value;

        if (!string.IsNullOrWhiteSpace(_settings.ApiBaseUrl))
        {
            _httpClient.BaseAddress = new Uri(_settings.ApiBaseUrl, UriKind.Absolute);
        }

        if (!_httpClient.DefaultRequestHeaders.Accept.Any())
        {
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }
    }

    public async Task<IReadOnlyList<AIItemDto>> GeneratePackingListAsync(string prompt)
    {
        if (string.IsNullOrWhiteSpace(prompt))
        {
            throw new CustomException("Prompt cannot be empty");
        }

        if (string.IsNullOrWhiteSpace(_settings.ApiKey))
        {
            throw new CustomException("Gemini API key is not configured");
        }

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    role = "user",
                    parts = new[]
                    {
                        new
                        {
                            text = BuildPrompt(prompt)
                        }
                    }
                }
            },
            generationConfig = new
            {
                responseMimeType = "application/json",
                responseSchema = BuildResponseSchema(),
                temperature = 0.3
            }
        };

        var requestUrl = $"models/{_settings.Model}:generateContent?key={_settings.ApiKey}";

        using var request = new HttpRequestMessage(HttpMethod.Post, requestUrl)
        {
            Content = new StringContent(JsonSerializer.Serialize(requestBody, _jsonOptions), Encoding.UTF8, "application/json")
        };

        using var response = await _httpClient.SendAsync(request);
        var responseContent = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            var message = string.IsNullOrWhiteSpace(responseContent)
                ? "Gemini request failed"
                : responseContent;
            throw new CustomException(message);
        }

        var textPayload = ExtractTextPayload(responseContent);
        if (string.IsNullOrWhiteSpace(textPayload))
        {
            throw new CustomException("Gemini response did not contain a usable payload");
        }

        try
        {
            var items = JsonSerializer.Deserialize<List<AIItemDto>>(textPayload, _jsonOptions);
            if (items == null || items.Count == 0)
            {
                throw new CustomException("Gemini response did not include any packing list items");
            }

            return items;
        }
        catch (JsonException ex)
        {
            throw new CustomException($"Failed to parse Gemini response: {ex.Message}");
        }
    }

    private static string BuildPrompt(string userPrompt)
    {
        return "You are a travel assistant. Generate a concise packing list based on the user's trip description. " +
               "Return only JSON that matches the provided schema. Do not add extra keys or commentary. " +
               $"User request: {userPrompt}";
    }

    private static object BuildResponseSchema()
    {
        return new
        {
            type = "array",
            items = new
            {
                type = "object",
                properties = new
                {
                    category = new
                    {
                        type = "string",
                        description = "Category for the item, such as Clothing, Gear, Documents, Health, Electronics, or Misc."
                    },
                    item_name = new
                    {
                        type = "string",
                        description = "Name of the item to pack."
                    },
                    unit = new
                    {
                        type = "string",
                        description = "Unit for the item, such as pcs, pairs, bottles, or sets."
                    },
                    value = new
                    {
                        type = "number",
                        description = "Recommended quantity as a number."
                    },
                    recommendations = new
                    {
                        type = "string",
                        description = "Short notes or conditions for the item."
                    }
                },
                required = new[]
                {
                    "category",
                    "item_name",
                    "unit",
                    "value",
                    "recommendations"
                }
            }
        };
    }

    private static string? ExtractTextPayload(string responseContent)
    {
        try
        {
            using var document = JsonDocument.Parse(responseContent);
            var root = document.RootElement;

            if (root.TryGetProperty("candidates", out var candidates) && candidates.ValueKind == JsonValueKind.Array && candidates.GetArrayLength() > 0)
            {
                var candidate = candidates[0];
                if (candidate.TryGetProperty("content", out var content)
                    && content.TryGetProperty("parts", out var parts)
                    && parts.ValueKind == JsonValueKind.Array)
                {
                    foreach (var part in parts.EnumerateArray())
                    {
                        if (part.TryGetProperty("text", out var text))
                        {
                            return text.GetString();
                        }
                    }
                }
            }

            if (root.TryGetProperty("text", out var rootText))
            {
                return rootText.GetString();
            }
        }
        catch
        {
            return null;
        }

        return null;
    }
}
