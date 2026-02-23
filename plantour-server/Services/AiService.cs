using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using AutoMapper;
using Microsoft.Extensions.Options;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class AiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly GeminiSettings _settings;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web);
    private readonly AiPromptRepository _aiPromptRepository;
    private readonly ICheckAccessService _checkAccessService;
    private readonly AiRepository _aiRepository;
    private readonly ThingRepository _thingsRepository;
    private readonly IMapper _mapper;
    private readonly CurrentUser _currentUser;
    private readonly TripThingRepository _tripThingRepository;
    private readonly TripSharedRepository _tripSharedRepository;


// TODO: Explore using the Gemini streaming API 
    public AiService(
        HttpClient httpClient,
        IOptions<GeminiSettings> settings,
        AiPromptRepository aiPromptRepository,
        AiRepository aiRepository,
        ICheckAccessService checkAccessService,
        TripSharedRepository tripSharedRepository,
        ThingRepository thingsRepository,
        TripThingRepository tripThingRepository,

        IMapper mapper,
        HttpCurrentUser httpCurrentUser)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _aiPromptRepository = aiPromptRepository;
        _aiRepository = aiRepository;
        _mapper = mapper;
        _currentUser = httpCurrentUser.CurrentUser;
        _checkAccessService = checkAccessService;
        _tripSharedRepository = tripSharedRepository;
        _thingsRepository = thingsRepository;
        _tripThingRepository = tripThingRepository;

        if (!string.IsNullOrWhiteSpace(_settings.ApiBaseUrl))
        {
            _httpClient.BaseAddress = new Uri(_settings.ApiBaseUrl, UriKind.Absolute);
        }

        if (!_httpClient.DefaultRequestHeaders.Accept.Any())
        {
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }
    }

    public async Task<IEnumerable<AiPromptDto>> GetLatestPrompts()
    {
        _currentUser.RaiseIfNotAuthenticated();

        var prompts = await _aiPromptRepository.GetAllMonthAsync(_currentUser.UserId);
        var dtos = _mapper.Map<IEnumerable<AiPromptDto>>(prompts);
        return dtos;
    }

    // TODO: Prompts older than 1 month should be cleaned up from the database periodically
    public async Task<IEnumerable<AiItemDto>> GetAllByPromptAsync(string prompt)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (string.IsNullOrWhiteSpace(prompt))
        {
            return Array.Empty<AiItemDto>();
        }

        prompt = prompt.Trim();

        var promptEntity = await _aiPromptRepository.GetByPromptMonthAsync(_currentUser.UserId, prompt);

        if (promptEntity != null)
        {
            var existingThings = await _aiRepository.FindAsync(x => x.PromptId == promptEntity.Id);
            return _mapper.Map<IEnumerable<AiItemDto>>(existingThings);
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
            return Array.Empty<AiItemDto>();
        }

        List<AiItemRaw>? raw_items;
        try
        {
            raw_items = JsonSerializer.Deserialize<List<AiItemRaw>>(textPayload, _jsonOptions);
            
            if (raw_items == null || raw_items.Count == 0)
            {
                return Array.Empty<AiItemDto>();
            }
        }
        catch (JsonException ex)
        {
            throw new CustomException($"Failed to parse Gemini response: {ex.Message}");
        }


        AiPrompt aiPrompt = new AiPrompt
        {
            UserId = _currentUser.UserId,
            Prompt = prompt,
            CreatedAt = DateTime.UtcNow
        };

        await _aiPromptRepository.AddAsync(aiPrompt);

        List<AiThing> items = new List<AiThing>();

        foreach (var item in raw_items)
        {
            AiThing aiThing = new AiThing
            {
                PromptId = aiPrompt.Id,
                Category = item.Category,
                Name = item.Name,
                Units = item.Units,
                Value = item.Value,
                Notes = item.Notes
            };

            items.Add(aiThing);
        }

        await _aiRepository.AddRangeAsync(items);
        var result = _mapper.Map<IEnumerable<AiItemDto>>(items);
        return result;
    }

    public async Task<IEnumerable<AiItemDto>> GetAllByPromptIdAsync(Guid promptId)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var items = await _aiRepository.FindAsync(x => x.PromptId == promptId && x.Prompt.UserId == _currentUser.UserId);
        var result = _mapper.Map<IEnumerable<AiItemDto>>(items);
        return result;
    }

    private static string BuildPrompt(string userPrompt)
    {
        return "You are a travel assistant. Generate a concise packing list based on the user's trip description. " +
               "Return only JSON that matches the provided schema. Do not add extra keys or commentary. Item names must be unique" +
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
                    name = new
                    {
                        type = "string",
                        description = "Name of the item to pack."
                    },
                    units = new
                    {
                        type = "string",
                        description = "Unit for the item, such as pcs, pairs, bottles, or sets."
                    },
                    value = new
                    {
                        type = "number",
                        description = "Recommended quantity as a number."
                    },
                    notes = new
                    {
                        type = "string",
                        description = "Short notes or conditions for the item."
                    }
                },
                required = new[]
                {
                    "category",
                    "name",
                    "units",
                    "value",
                    "notes"
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

    public async Task<IEnumerable<AiItemDto>> GetAllForTripAsync(Guid tripId, string prompt)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        if (string.IsNullOrWhiteSpace(prompt))
        {
            return Array.Empty<AiItemDto>();
        }


        var tripThings = await _tripThingRepository.GetAllAsync(_currentUser.AdminId, _currentUser.UserId, tripId);
        var tripThingNames = new HashSet<string>(tripThings.Select(tp => tp.Name), StringComparer.OrdinalIgnoreCase);
        var aiTemplateThings = await GetAllByPromptAsync(prompt);

        var result = aiTemplateThings.Select(p =>
        {
            p.IsTargeted = tripThingNames.Contains(p.Name, StringComparer.OrdinalIgnoreCase);
            return p;
        }).ToList();

        return result;
    }

    public async Task<IEnumerable<AiItemDto>> GetAllForTripSharedAsync(Guid tripId, string prompt)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }
        if (string.IsNullOrWhiteSpace(prompt))
        {
            return Array.Empty<AiItemDto>();
        }


        var tripSharedThings = await _tripSharedRepository.GetAllFullAsync(tripId);
        var tripThingNames = new HashSet<string>(tripSharedThings.Select(tp => tp.Name), StringComparer.OrdinalIgnoreCase);
        var aiTemplateThings = await GetAllByPromptAsync(prompt);

        var result = aiTemplateThings.Select(p =>
        {
            p.IsTargeted = tripThingNames.Contains(p.Name, StringComparer.OrdinalIgnoreCase);
            return p;
        }).ToList();

        return result;
    }

    public async Task<IEnumerable<AiItemDto>> GetAllForDicAsync(string prompt)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (string.IsNullOrWhiteSpace(prompt))
        {
            return Array.Empty<AiItemDto>();
        }


        var targetThings = await _thingsRepository.FindAsync(x => x.UserId == _currentUser.UserId);
        var targetThingNames = new HashSet<string>(targetThings.Select(tp => tp.Name), StringComparer.OrdinalIgnoreCase);
        var aiTemplateThings = await GetAllByPromptAsync(prompt);

        var result = aiTemplateThings.Select(p =>
        {
            p.IsTargeted = targetThingNames.Contains(p.Name, StringComparer.OrdinalIgnoreCase);
            return p;
        }).ToList();

        return result;
    }
}
