using System.Net.Http.Headers;
using System.Globalization;
using System.Text;
using System.Text.Json;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using plantour_server.Utils.Logging;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class AiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly GeminiSettings _settings;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web);
    private readonly AiPromptRepository _aiPromptRepository;
    private readonly AiTripPlanRepository _aiTripPlanRepository;
    private readonly ICheckAccessService _checkAccessService;
    private readonly ITripService _tripService;
    private readonly AiRepository _aiRepository;
    private readonly AiPromptChecksRepository _aiPromptChecksRepository;
    private readonly ThingRepository _thingsRepository;
    private readonly IMapper _mapper;
    private readonly CurrentUser _currentUser;
    private readonly TripUserRepository _tripUserRepository;
    private readonly TripThingRepository _tripThingRepository;
    private readonly TripSharedRepository _tripSharedRepository;
    private readonly PlantourContext _context;



    public AiService(
        HttpClient httpClient,
        IOptions<GeminiSettings> settings,
        AiPromptRepository aiPromptRepository,
        AiTripPlanRepository aiTripPlanRepository,
        AiRepository aiRepository,
        ICheckAccessService checkAccessService,
        ITripService tripService,
        TripSharedRepository tripSharedRepository,
        ThingRepository thingsRepository,
        TripUserRepository tripUserRepository,
        TripThingRepository tripThingRepository,
        AiPromptChecksRepository aiPromptChecksRepository,
        PlantourContext context,

        IMapper mapper,
        HttpCurrentUser httpCurrentUser)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _aiPromptRepository = aiPromptRepository;
        _aiTripPlanRepository = aiTripPlanRepository;
        _aiRepository = aiRepository;
        _mapper = mapper;
        _currentUser = httpCurrentUser.CurrentUser;
        _checkAccessService = checkAccessService;
        _tripService = tripService;
        _tripSharedRepository = tripSharedRepository;
        _thingsRepository = thingsRepository;
        _tripUserRepository = tripUserRepository;
        _tripThingRepository = tripThingRepository;
        _aiPromptChecksRepository = aiPromptChecksRepository;
        _context = context;

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

    public async Task<IEnumerable<TripAiQuestionDto>> GetLatestTripPlanQuestionsAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();

        var plans = await _aiTripPlanRepository.GetAllMonthAsync(_currentUser.UserId);
        return plans.Select(x => new TripAiQuestionDto
        {
            Question = x.Question,
            CreatedAt = x.CreatedAt
        });
    }

    private async Task CheckAccessAsync()
    {
        var rule = _currentUser.AccessRules!.FirstOrDefault(x => x.Id == 70);
        var granted = rule!.Granted;
        if (granted)
        {
            return;
        }

        AiPromptCheck? check = await _aiPromptChecksRepository.GetByIdAsync(_currentUser.UserId);
        if (check == null)
        {
            check = new AiPromptCheck
            {
                Id = _currentUser.UserId,
                Count = 1,
                Start = DateTime.UtcNow
            };
            await _aiPromptChecksRepository.AddAsync(check);
            return;
        }

        var now = DateTime.UtcNow;
        if (check.Start > now)
        {
            throw new CustomException("Invalid prompt check record. Start time cannot be in the future.");
        }

        if (now - check.Start > TimeSpan.FromDays(1))
        {
            check.Count = 1;
            check.Start = now;
            await _aiPromptChecksRepository.UpdateAsync(check);
            return;
        }

        int limit = rule.Value!.Value;

        if (check.Count < limit)
        {
            check.Count += 1;
            await _aiPromptChecksRepository.UpdateAsync(check);
            return;
        }


        var s0 = $"You will be able to send more prompts after {check.Start.AddDays(1).ToLocalTime():f}.";

        var s1 = $"You've reached the limit of {limit} AI prompts per day. {s0}";
        var s2 = _currentUser.IsAdmin ? "\nPlease go to your profile page and upgrade your plan to remove this limit." : "\nPlease ask your administrator to upgrade the plan to remove this limit.";
        throw new CustomException($"{s1} {s2}", "PLAN_LIMIT_REACHED");
    }
    
    public async Task<IEnumerable<AiItemDto>> GetAllByPromptAsync(string prompt)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (string.IsNullOrWhiteSpace(prompt))
        {
            return Array.Empty<AiItemDto>();
        }

        prompt = prompt.Trim();

        var promptEntity = await _aiPromptRepository.GetByPromptAsync(_currentUser.UserId, prompt);

        if (promptEntity != null)
        {
            var existingThings = await _aiRepository.FindAsync(x => x.PromptId == promptEntity.Id);
            return _mapper.Map<IEnumerable<AiItemDto>>(existingThings);
        }

        if (string.IsNullOrWhiteSpace(_settings.ApiKey))
        {
            throw new CustomException("Gemini API key is not configured");
        }

        await CheckAccessAsync();

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

    public async Task<TripAiApplyResponseDto> ApplyTripPlanAsync(Guid tripId, string prompt)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        if (string.IsNullOrWhiteSpace(prompt))
        {
            throw new CustomException("Prompt is required");
        }

        var trip = await _context.Trips
            .Include(x => x.Currency)
            .FirstOrDefaultAsync(x => x.Id == tripId && x.UserId == _currentUser.AdminId);

        if (trip == null)
        {
            throw new CustomException("Trip not found");
        }

        var tripUser = await _tripUserRepository.GetByTripIdAsync(_currentUser.AdminId, _currentUser.UserId, tripId);
        if (tripUser == null)
        {
            throw new CustomException("Trip user not found");
        }

        var normalizedPrompt = prompt.Trim();
        var preview = await GetOrCreateTripPlanAsync(normalizedPrompt, trip.Currency.Name);
        var plan = ClonePlan(preview.Plan);
        return await ApplyGeneratedTripPlanAsync(trip, tripUser.Id, normalizedPrompt, plan);
    }

    public async Task<TripAiPreviewResponseDto> GetTripPlanPreviewAsync(string question, string currencyText)
    {
        _currentUser.RaiseIfNotAuthenticated();

        var normalizedQuestion = NormalizeQuestion(question);
        var result = await GetOrCreateTripPlanAsync(normalizedQuestion, NormalizeCurrencyText(currencyText));

        return new TripAiPreviewResponseDto
        {
            Question = normalizedQuestion,
            Plan = ClonePlan(result.Plan),
            FromCache = result.FromCache,
            DatesAdjusted = result.DatesAdjusted
        };
    }

    public async Task<TripAiCreateTripResponseDto> CreateTripFromPlanAsync(CreateTripFromAiPlanRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        if (request.CurrencyId == Guid.Empty)
        {
            throw new CustomException("Currency is required");
        }

        var normalizedQuestion = NormalizeQuestion(request.Question);
        var preview = await GetOrCreateTripPlanAsync(normalizedQuestion, string.Empty);
        var plan = ClonePlan(preview.Plan);

        if (request.StartDate.HasValue != request.EndDate.HasValue)
        {
            throw new CustomException("Both start and end dates are required when overriding trip dates");
        }

        if (request.StartDate.HasValue && request.EndDate.HasValue)
        {
            if (request.EndDate.Value < request.StartDate.Value)
            {
                throw new CustomException("Trip end date cannot be earlier than start date");
            }

            OverridePlanDates(plan, request.StartDate.Value, request.EndDate.Value);
        }

        var startDate = ParseDateOnly(plan.SuggestedStartDate) ?? DateOnly.FromDateTime(DateTime.UtcNow.Date);
        var endDate = ParseDateOnly(plan.SuggestedEndDate) ?? startDate.AddDays(7);
        if (endDate < startDate)
        {
            endDate = startDate;
        }

        var planningStatusId = await _context.TripStatuses
            .Where(x => x.Name.ToLower() == "planning")
            .Select(x => x.Id)
            .FirstOrDefaultAsync();

        if (planningStatusId == Guid.Empty)
        {
            throw new CustomException("Planning trip status not found");
        }

        var tripName = await GenerateUniqueTripNameAsync(CleanRequired(plan.Title) ?? BuildFallbackTripName(normalizedQuestion));
        var createdTrip = await _tripService.AddAsync(new CreateTripRequest
        {
            TripStatusId = planningStatusId,
            CurrencyId = request.CurrencyId,
            Name = tripName,
            StartDate = startDate,
            EndDate = endDate
        });

        var trip = await _context.Trips
            .Include(x => x.Currency)
            .FirstOrDefaultAsync(x => x.Id == createdTrip.Id && x.UserId == _currentUser.AdminId)
            ?? throw new CustomException("Trip not found after creation");

        var tripUser = await _tripUserRepository.GetByTripIdAsync(_currentUser.AdminId, _currentUser.UserId, trip.Id)
            ?? throw new CustomException("Trip user not found after creation");

        var applied = await ApplyGeneratedTripPlanAsync(trip, tripUser.Id, normalizedQuestion, plan);

        return new TripAiCreateTripResponseDto
        {
            TripId = trip.Id,
            TripName = trip.Name,
            Plan = applied.Plan,
            Applied = applied.Applied
        };
    }

    private async Task<TripAiPlanDto> GenerateTripPlanAsync(string prompt, string currencyText)
    {
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
                            text = BuildTripPlanPrompt(prompt, currencyText)
                        }
                    }
                }
            },
            generationConfig = new
            {
                responseMimeType = "application/json",
                responseSchema = BuildTripPlanResponseSchema(),
                temperature = 0.4
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
            throw new CustomException("Gemini returned an empty trip plan");
        }

        try
        {
            var plan = JsonSerializer.Deserialize<TripAiPlanDto>(textPayload, _jsonOptions);
            if (plan == null)
            {
                throw new CustomException("Gemini returned an empty trip plan");
            }

            NormalizeTripPlan(plan);
            if (string.IsNullOrWhiteSpace(plan.CurrencyText))
            {
                plan.CurrencyText = currencyText;
            }
            return plan;
        }
        catch (JsonException ex)
        {
            throw new CustomException($"Failed to parse Gemini trip plan: {ex.Message}");
        }
    }

    private async Task<(TripAiPlanDto Plan, bool FromCache, bool DatesAdjusted)> GetOrCreateTripPlanAsync(string question, string currencyText)
    {
        var normalizedQuestion = NormalizeQuestion(question);
        var normalizedCurrencyText = NormalizeCurrencyText(currencyText);
        var existing = await _aiTripPlanRepository.GetByQuestionAsync(_currentUser.UserId, normalizedQuestion);
        if (existing != null)
        {
            try
            {
                var storedPlan = JsonSerializer.Deserialize<TripAiPlanDto>(existing.Plan, _jsonOptions)
                    ?? throw new CustomException("Stored AI trip plan is empty");
                NormalizeTripPlan(storedPlan);
                if (string.IsNullOrWhiteSpace(storedPlan.CurrencyText) && !string.IsNullOrWhiteSpace(normalizedCurrencyText))
                {
                    storedPlan.CurrencyText = normalizedCurrencyText;
                }
                return (storedPlan, true, false);
            }
            catch (JsonException ex)
            {
                throw new CustomException($"Failed to parse stored AI trip plan: {ex.Message}");
            }
        }

        if (string.IsNullOrWhiteSpace(_settings.ApiKey))
        {
            throw new CustomException("Gemini API key is not configured");
        }

        await CheckAccessAsync();

        var generatedPlan = await GenerateTripPlanAsync(normalizedQuestion, normalizedCurrencyText);
        var datesAdjusted = await ShiftPlanDatesToAvoidOverlapAsync(generatedPlan);
        var serializedPlan = JsonSerializer.Serialize(generatedPlan, _jsonOptions);

        try
        {
            await _aiTripPlanRepository.AddAsync(new AiTripPlan
            {
                Id = Guid.NewGuid(),
                UserId = _currentUser.UserId,
                Question = normalizedQuestion,
                Plan = serializedPlan,
                CreatedAt = DateTime.UtcNow
            });
        }
        catch (DbUpdateException)
        {
            var stored = await _aiTripPlanRepository.GetByQuestionAsync(_currentUser.UserId, normalizedQuestion);
            if (stored != null)
            {
                var storedPlan = JsonSerializer.Deserialize<TripAiPlanDto>(stored.Plan, _jsonOptions)
                    ?? throw new CustomException("Stored AI trip plan is empty");
                NormalizeTripPlan(storedPlan);
                if (string.IsNullOrWhiteSpace(storedPlan.CurrencyText) && !string.IsNullOrWhiteSpace(normalizedCurrencyText))
                {
                    storedPlan.CurrencyText = normalizedCurrencyText;
                }
                return (storedPlan, true, false);
            }

            throw;
        }

        return (generatedPlan, false, datesAdjusted);
    }

    private async Task<TripAiApplyResponseDto> ApplyGeneratedTripPlanAsync(Trip trip, Guid tripUserId, string prompt, TripAiPlanDto plan)
    {
        var counts = new TripAiAppliedCountsDto();
        var now = DateTime.UtcNow;

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var parsedStartDate = ParseDateOnly(plan.SuggestedStartDate);
        var parsedEndDate = ParseDateOnly(plan.SuggestedEndDate);

        if (parsedStartDate.HasValue)
        {
            trip.StartDate = parsedStartDate.Value;
        }

        if (parsedEndDate.HasValue)
        {
            trip.EndDate = parsedEndDate.Value < trip.StartDate ? trip.StartDate : parsedEndDate.Value;
        }

        var notesSection = BuildTripNotesSection(prompt, plan);
        if (!string.IsNullOrWhiteSpace(notesSection) && !(trip.Notes ?? string.Empty).Contains(notesSection, StringComparison.Ordinal))
        {
            trip.Notes = string.IsNullOrWhiteSpace(trip.Notes)
                ? notesSection
                : $"{trip.Notes!.Trim()}\n\n{notesSection}";
            counts.NotesUpdated = true;
        }

        var itineraryParts = await _context.ItineraryParts.Where(x => x.TripId == trip.Id).ToListAsync();
        var itineraryLookup = itineraryParts.ToDictionary(
            x => BuildItineraryKey(x.Name, x.StartDate),
            x => x,
            StringComparer.OrdinalIgnoreCase);

        var createdOrExistingParts = new List<ItineraryPart>();

        for (var index = 0; index < plan.Itinerary.Count; index++)
        {
            var rawPart = plan.Itinerary[index];
            var name = CleanRequired(rawPart.Name);
            if (name == null)
            {
                createdOrExistingParts.Add(new ItineraryPart { Id = Guid.Empty, TripId = trip.Id, Name = string.Empty, StartDate = now });
                continue;
            }

            var startDate = ParseDateTime(rawPart.StartDate) ?? BuildFallbackItineraryStart(trip.StartDate, index);
            var endDate = ParseDateTime(rawPart.EndDate);
            if (endDate.HasValue && endDate.Value < startDate)
            {
                endDate = startDate.AddHours(1);
            }

            var key = BuildItineraryKey(name, startDate);
            if (!itineraryLookup.TryGetValue(key, out var partEntity))
            {
                partEntity = new ItineraryPart
                {
                    Id = Guid.NewGuid(),
                    TripId = trip.Id,
                    Name = name,
                    Category = CleanOptional(rawPart.Category),
                    Address = CleanOptional(rawPart.Address),
                    Latitude = NormalizeLatitude(rawPart.Latitude),
                    Longitude = NormalizeLongitude(rawPart.Longitude),
                    Notes = CleanOptional(rawPart.Notes),
                    StartDate = startDate,
                    EndDate = endDate,
                    CreatedAt = now
                };

                _context.ItineraryParts.Add(partEntity);
                itineraryLookup[key] = partEntity;
                counts.ItineraryPartsAdded += 1;
            }

            createdOrExistingParts.Add(partEntity);
        }

        var existingActivities = await _context.TripActivities
            .Where(x => x.TripId == trip.Id && (x.TripUserId == null || x.TripUserId == tripUserId))
            .ToListAsync();
        var activityKeys = new HashSet<string>(existingActivities.Select(BuildActivityKey), StringComparer.OrdinalIgnoreCase);

        for (var index = 0; index < plan.Itinerary.Count; index++)
        {
            var rawPart = plan.Itinerary[index];
            var itineraryPart = createdOrExistingParts[index];

            if (itineraryPart.Id == Guid.Empty)
            {
                continue;
            }

            counts.PublicActivitiesAdded += AddActivities(rawPart.PublicActivities, itineraryPart, null);
            counts.PersonalActivitiesAdded += AddActivities(rawPart.PersonalActivities, itineraryPart, tripUserId);
        }

        var personalThingNames = new HashSet<string>(await _context.TripUserThings
            .Where(x => x.TripUserId == tripUserId)
            .Select(x => x.Name)
            .ToListAsync(), StringComparer.OrdinalIgnoreCase);
        var remainingPersonalItemCapacity = await GetRemainingItemCapacityAsync(
            () => _context.TripUserThings.CountAsync(x => x.TripUserId == tripUserId));

        foreach (var item in plan.PersonalItems)
        {
            if (remainingPersonalItemCapacity <= 0)
            {
                break;
            }

            var name = CleanRequired(item.Name);
            if (name == null || !personalThingNames.Add(name))
            {
                continue;
            }

            _context.TripUserThings.Add(new TripUserThing
            {
                Id = Guid.NewGuid(),
                TripUserId = tripUserId,
                Category = CleanOptional(item.Category),
                Name = name,
                Units = CleanOptional(item.Units),
                Value = item.Value > 0 ? item.Value : null,
                Notes = CleanOptional(item.Notes)
            });
            counts.PersonalItemsAdded += 1;
            remainingPersonalItemCapacity -= 1;
        }

        var sharedThingNames = new HashSet<string>(await _context.TripSharedThings
            .Where(x => x.TripId == trip.Id)
            .Select(x => x.Name)
            .ToListAsync(), StringComparer.OrdinalIgnoreCase);
        var remainingSharedItemCapacity = await GetRemainingItemCapacityAsync(
            () => _context.TripSharedThings.CountAsync(x => x.TripId == trip.Id));

        foreach (var item in plan.SharedItems)
        {
            if (remainingSharedItemCapacity <= 0)
            {
                break;
            }

            var name = CleanRequired(item.Name);
            if (name == null || !sharedThingNames.Add(name))
            {
                continue;
            }

            _context.TripSharedThings.Add(new TripSharedThing
            {
                Id = Guid.NewGuid(),
                TripId = trip.Id,
                Category = CleanOptional(item.Category),
                Name = name,
                Units = CleanOptional(item.Units),
                Value = item.Value > 0 ? item.Value : null,
                Notes = CleanOptional(item.Notes),
                AssignedToId = null,
                AssignedThingId = null,
                AssignedAt = null,
                AssignedDeadline = null,
                Rejected = false
            });
            counts.SharedItemsAdded += 1;
            remainingSharedItemCapacity -= 1;
        }

        var personalTodoNames = new HashSet<string>(await _context.TripUserTodos
            .Where(x => x.TripUserId == tripUserId)
            .Select(x => x.Name)
            .ToListAsync(), StringComparer.OrdinalIgnoreCase);

        foreach (var todo in plan.PersonalTodos)
        {
            var name = CleanRequired(todo.Name);
            if (name == null || !personalTodoNames.Add(name))
            {
                continue;
            }

            _context.TripUserTodos.Add(new TripUserTodo
            {
                Id = Guid.NewGuid(),
                TripUserId = tripUserId,
                Category = CleanOptional(todo.Category),
                Name = name,
                Notes = CleanOptional(todo.Notes)
            });
            counts.PersonalTodosAdded += 1;
        }

        var sharedTodoNames = new HashSet<string>(await _context.TripSharedTodos
            .Where(x => x.TripId == trip.Id)
            .Select(x => x.Name)
            .ToListAsync(), StringComparer.OrdinalIgnoreCase);

        foreach (var todo in plan.SharedTodos)
        {
            var name = CleanRequired(todo.Name);
            if (name == null || !sharedTodoNames.Add(name))
            {
                continue;
            }

            _context.TripSharedTodos.Add(new TripSharedTodo
            {
                Id = Guid.NewGuid(),
                TripId = trip.Id,
                Category = CleanOptional(todo.Category),
                Name = name,
                Notes = CleanOptional(todo.Notes),
                AssignedToId = null,
                AssignedTodoId = null,
                AssignedAt = null,
                AssignedDeadline = null,
                Rejected = false
            });
            counts.SharedTodosAdded += 1;
        }

        var personalExpenseKeys = new HashSet<string>((await _context.TripUserExpenses
            .Where(x => x.TripUserId == tripUserId)
            .Select(x => new { x.Name, x.Amount })
            .ToListAsync())
            .Select(x => BuildExpenseKey(x.Name, x.Amount)), StringComparer.OrdinalIgnoreCase);

        foreach (var expense in plan.PersonalExpenses)
        {
            var name = CleanRequired(expense.Name);
            if (name == null || expense.Amount <= 0)
            {
                continue;
            }

            var key = BuildExpenseKey(name, expense.Amount);
            if (!personalExpenseKeys.Add(key))
            {
                continue;
            }

            _context.TripUserExpenses.Add(new TripUserExpense
            {
                Id = Guid.NewGuid(),
                TripUserId = tripUserId,
                Name = name,
                PaymentMethod = CleanOptional(expense.PaymentMethod),
                CurrencyId = trip.CurrencyId,
                Rate = 1m,
                Amount = expense.Amount,
                RecipientId = null,
                Notes = BuildExpenseNotes(expense)
            });
            counts.PersonalExpensesAdded += 1;
        }

        var sharedExpenseKeys = new HashSet<string>((await _context.TripSharedExpenses
            .Where(x => x.TripId == trip.Id)
            .Select(x => new { x.Name, x.Amount })
            .ToListAsync())
            .Select(x => BuildExpenseKey(x.Name, x.Amount)), StringComparer.OrdinalIgnoreCase);

        foreach (var expense in plan.SharedExpenses)
        {
            var name = CleanRequired(expense.Name);
            if (name == null || expense.Amount <= 0)
            {
                continue;
            }

            var key = BuildExpenseKey(name, expense.Amount);
            if (!sharedExpenseKeys.Add(key))
            {
                continue;
            }

            _context.TripSharedExpenses.Add(new TripSharedExpense
            {
                Id = Guid.NewGuid(),
                TripId = trip.Id,
                Category = CleanOptional(expense.Category),
                Name = name,
                PaymentMethod = CleanOptional(expense.PaymentMethod),
                CurrencyId = trip.CurrencyId,
                Amount = expense.Amount,
                Notes = BuildExpenseNotes(expense),
                AssignedToId = null,
                AssignedExpenseId = null,
                AssignedAt = null,
                AssignedDeadline = null,
                Rejected = false
            });
            counts.SharedExpensesAdded += 1;
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return new TripAiApplyResponseDto
        {
            Plan = plan,
            Applied = counts
        };

        int AddActivities(IEnumerable<TripAiActivityDto> activities, ItineraryPart itineraryPart, Guid? activityTripUserId)
        {
            var added = 0;

            foreach (var activity in activities)
            {
                var name = CleanRequired(activity.Name);
                if (name == null)
                {
                    continue;
                }

                var activityStart = ParseDateTime(activity.StartDate) ?? itineraryPart.StartDate;
                var activityEnd = ParseDateTime(activity.EndDate);
                if (activityEnd.HasValue && activityEnd.Value < activityStart)
                {
                    activityEnd = activityStart.AddHours(1);
                }

                var key = BuildActivityKey(activityTripUserId, itineraryPart.Id, name, activityStart);
                if (!activityKeys.Add(key))
                {
                    continue;
                }

                _context.TripActivities.Add(new TripActivity
                {
                    Id = Guid.NewGuid(),
                    TripId = trip.Id,
                    TripUserId = activityTripUserId,
                    ItineraryPartId = itineraryPart.Id,
                    Activity = CleanOptional(activity.Activity),
                    Name = name,
                    Notes = CleanOptional(activity.Notes),
                    StartDate = activityStart,
                    EndDate = activityEnd,
                    Address = CleanOptional(activity.Address),
                    Latitude = NormalizeLatitude(activity.Latitude),
                    Longitude = NormalizeLongitude(activity.Longitude)
                });
                added += 1;
            }

            return added;
        }
    }

    private async Task<int> GetRemainingItemCapacityAsync(Func<Task<int>> currentCountFactory)
    {
        var rule = _currentUser.AccessRules!.FirstOrDefault(x => x.Id == 40);
        if (rule == null || rule.Granted)
        {
            return int.MaxValue;
        }

        var limit = rule.Value ?? 0;
        var currentCount = await currentCountFactory();
        return Math.Max(0, limit - currentCount);
    }

    private static void NormalizeTripPlan(TripAiPlanDto plan)
    {
        plan.Title = CleanOptional(plan.Title) ?? string.Empty;
        plan.Summary = CleanOptional(plan.Summary) ?? string.Empty;
        plan.CurrencyText = CleanOptional(plan.CurrencyText) ?? string.Empty;
        plan.GeneralRecommendations = CleanOptional(plan.GeneralRecommendations) ?? string.Empty;
        plan.SuggestedStartDate = CleanOptional(plan.SuggestedStartDate) ?? string.Empty;
        plan.SuggestedEndDate = CleanOptional(plan.SuggestedEndDate) ?? string.Empty;
        plan.Assumptions = (plan.Assumptions ?? []).Select(x => CleanOptional(x)).Where(x => x != null).Cast<string>().Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        plan.Itinerary ??= [];
        plan.PersonalItems ??= [];
        plan.SharedItems ??= [];
        plan.PersonalTodos ??= [];
        plan.SharedTodos ??= [];
        plan.PersonalExpenses ??= [];
        plan.SharedExpenses ??= [];

        foreach (var part in plan.Itinerary)
        {
            part.Name = CleanOptional(part.Name) ?? string.Empty;
            part.Category = CleanOptional(part.Category) ?? string.Empty;
            part.Address = CleanOptional(part.Address) ?? string.Empty;
            part.Latitude = NormalizeLatitude(part.Latitude);
            part.Longitude = NormalizeLongitude(part.Longitude);
            part.Notes = CleanOptional(part.Notes) ?? string.Empty;
            part.StartDate = CleanOptional(part.StartDate) ?? string.Empty;
            part.EndDate = CleanOptional(part.EndDate) ?? string.Empty;
            part.PublicActivities ??= [];
            part.PersonalActivities ??= [];

            NormalizeActivities(part.PublicActivities);
            NormalizeActivities(part.PersonalActivities);
        }

        NormalizeThings(plan.PersonalItems);
        NormalizeThings(plan.SharedItems);
        NormalizeTodos(plan.PersonalTodos);
        NormalizeTodos(plan.SharedTodos);
        NormalizeExpenses(plan.PersonalExpenses);
        NormalizeExpenses(plan.SharedExpenses);
    }

    private static void NormalizeActivities(List<TripAiActivityDto> activities)
    {
        foreach (var activity in activities)
        {
            activity.Activity = CleanOptional(activity.Activity) ?? string.Empty;
            activity.Name = CleanOptional(activity.Name) ?? string.Empty;
            activity.Notes = CleanOptional(activity.Notes) ?? string.Empty;
            activity.StartDate = CleanOptional(activity.StartDate) ?? string.Empty;
            activity.EndDate = CleanOptional(activity.EndDate) ?? string.Empty;
            activity.Address = CleanOptional(activity.Address) ?? string.Empty;
            activity.Latitude = NormalizeLatitude(activity.Latitude);
            activity.Longitude = NormalizeLongitude(activity.Longitude);
        }
    }

    private static void NormalizeThings(List<TripAiThingDto> items)
    {
        foreach (var item in items)
        {
            item.Category = CleanOptional(item.Category) ?? string.Empty;
            item.Name = CleanOptional(item.Name) ?? string.Empty;
            item.Units = CleanOptional(item.Units) ?? string.Empty;
            item.Notes = CleanOptional(item.Notes) ?? string.Empty;
        }
    }

    private static void NormalizeTodos(List<TripAiTodoDto> todos)
    {
        foreach (var todo in todos)
        {
            todo.Category = CleanOptional(todo.Category) ?? string.Empty;
            todo.Name = CleanOptional(todo.Name) ?? string.Empty;
            todo.Notes = CleanOptional(todo.Notes) ?? string.Empty;
        }
    }

    private static void NormalizeExpenses(List<TripAiExpenseDto> expenses)
    {
        foreach (var expense in expenses)
        {
            expense.Category = CleanOptional(expense.Category) ?? string.Empty;
            expense.Name = CleanOptional(expense.Name) ?? string.Empty;
            expense.PaymentMethod = CleanOptional(expense.PaymentMethod) ?? string.Empty;
            expense.Notes = CleanOptional(expense.Notes) ?? string.Empty;
        }
    }

    private async Task<bool> ShiftPlanDatesToAvoidOverlapAsync(TripAiPlanDto plan)
    {
        var startDate = ParseDateOnly(plan.SuggestedStartDate);
        var endDate = ParseDateOnly(plan.SuggestedEndDate);

        if (!startDate.HasValue || !endDate.HasValue)
        {
            return false;
        }

        if (endDate.Value < startDate.Value)
        {
            endDate = startDate;
        }

        var trips = await _context.Trips
            .Where(x => x.UserId == _currentUser.AdminId)
            .OrderBy(x => x.StartDate)
            .Select(x => new { x.StartDate, x.EndDate })
            .ToListAsync();

        var originalStart = startDate.Value;
        var originalEnd = endDate.Value;
        var durationDays = originalEnd.DayNumber - originalStart.DayNumber;
        var proposedStart = originalStart;
        var proposedEnd = originalEnd;
        var adjusted = false;

        while (true)
        {
            var overlappingTrip = trips.FirstOrDefault(x => proposedStart < x.EndDate && proposedEnd > x.StartDate);
            if (overlappingTrip == null)
            {
                break;
            }

            proposedStart = overlappingTrip.EndDate;
            proposedEnd = proposedStart.AddDays(durationDays);
            adjusted = true;
        }

        if (!adjusted)
        {
            return false;
        }

        var deltaDays = proposedStart.DayNumber - originalStart.DayNumber;
        ShiftPlanDates(plan, deltaDays, proposedStart, proposedEnd);
        return true;
    }

    private static void OverridePlanDates(TripAiPlanDto plan, DateOnly newStartDate, DateOnly newEndDate)
    {
        var originalStart = ParseDateOnly(plan.SuggestedStartDate);
        var deltaDays = originalStart.HasValue
            ? newStartDate.DayNumber - originalStart.Value.DayNumber
            : 0;

        ShiftPlanDates(plan, deltaDays, newStartDate, newEndDate);
    }

    private static void ShiftPlanDates(TripAiPlanDto plan, int deltaDays, DateOnly newStartDate, DateOnly newEndDate)
    {
        plan.SuggestedStartDate = newStartDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        plan.SuggestedEndDate = newEndDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

        if (deltaDays == 0)
        {
            return;
        }

        foreach (var part in plan.Itinerary)
        {
            part.StartDate = ShiftIsoDateTime(part.StartDate, deltaDays);
            part.EndDate = ShiftIsoDateTime(part.EndDate, deltaDays);

            foreach (var activity in part.PublicActivities)
            {
                activity.StartDate = ShiftIsoDateTime(activity.StartDate, deltaDays);
                activity.EndDate = ShiftIsoDateTime(activity.EndDate, deltaDays);
            }

            foreach (var activity in part.PersonalActivities)
            {
                activity.StartDate = ShiftIsoDateTime(activity.StartDate, deltaDays);
                activity.EndDate = ShiftIsoDateTime(activity.EndDate, deltaDays);
            }
        }
    }

    private static string ShiftIsoDateTime(string value, int deltaDays)
    {
        var parsed = ParseDateTime(value);
        if (!parsed.HasValue)
        {
            return value;
        }

        return parsed.Value.AddDays(deltaDays).ToString("O", CultureInfo.InvariantCulture);
    }

    private async Task<string> GenerateUniqueTripNameAsync(string baseName)
    {
        var normalizedBaseName = baseName.Trim();
        var candidate = normalizedBaseName;
        var index = 2;

        while (await _context.Trips.AnyAsync(x => x.UserId == _currentUser.UserId && x.Name.ToLower() == candidate.ToLower()))
        {
            var suffix = $" ({index})";
            var maxBaseLength = Math.Max(1, 200 - suffix.Length);
            candidate = $"{normalizedBaseName[..Math.Min(normalizedBaseName.Length, maxBaseLength)]}{suffix}";
            index += 1;
        }

        return candidate;
    }

    private static string BuildFallbackTripName(string question)
    {
        var trimmed = question.Trim();
        if (trimmed.Length <= 200)
        {
            return trimmed;
        }

        return trimmed[..200].TrimEnd();
    }

    private static string NormalizeQuestion(string question)
    {
        if (string.IsNullOrWhiteSpace(question))
        {
            throw new CustomException("Question is required");
        }

        return question.Trim();
    }

    private TripAiPlanDto ClonePlan(TripAiPlanDto plan)
    {
        var serialized = JsonSerializer.Serialize(plan, _jsonOptions);
        return JsonSerializer.Deserialize<TripAiPlanDto>(serialized, _jsonOptions)
            ?? throw new CustomException("Failed to clone AI trip plan");
    }

    private static string BuildTripPlanPrompt(string userPrompt, string currencyText)
    {
        return "You are a travel planner inside a trip management application. " +
               "Generate a complete, practical trip plan from the user's description. " +
               "Return only JSON that matches the provided schema. Do not add markdown or commentary. " +
               "Use plain numeric estimated expense amounts without currency symbols. " +
               $"All expense estimates must be in {currencyText}. " +
               "Create unique names inside each collection. " +
               "Do not assign any shared items, shared todos, or shared expenses to participants. " +
               "Put transportation and lodging details into the itinerary, including flights and hotel stays. " +
               "For each itinerary part, include both public and personal activities when useful. " +
               "For every itinerary part and every activity, always include latitude and longitude when you can determine them confidently. " +
               "If precise coordinates are not known, still include the latitude and longitude fields with null values and provide the best available address. " +
               "When coordinates are available, ensure they match the described place so the trip can be shown on a map without extra geocoding. " +
               "General recommendations and assumptions should be concise and suitable to append into trip notes. " +
               $"Today is {DateTime.UtcNow:yyyy-MM-dd}. " +
               "If the request has vague timing like a season or month, choose a reasonable concrete date range in the nearest practical future and record that assumption. " +
               "SuggestedStartDate and SuggestedEndDate must use yyyy-MM-dd. " +
               "All itinerary and activity datetimes must use ISO 8601. " +
               $"User request: {userPrompt}";
    }

    private static object BuildTripPlanResponseSchema()
    {
        return new
        {
            type = "object",
            properties = new
            {
                title = new { type = "string" },
                summary = new { type = "string" },
                currencyText = new { type = "string" },
                generalRecommendations = new { type = "string" },
                assumptions = new
                {
                    type = "array",
                    items = new { type = "string" }
                },
                suggestedStartDate = new { type = "string" },
                suggestedEndDate = new { type = "string" },
                itinerary = new
                {
                    type = "array",
                    items = new
                    {
                        type = "object",
                        properties = new
                        {
                            name = new { type = "string" },
                            category = new { type = "string" },
                            address = new { type = "string" },
                            latitude = new { type = new[] { "number", "null" } },
                            longitude = new { type = new[] { "number", "null" } },
                            notes = new { type = "string" },
                            startDate = new { type = "string" },
                            endDate = new { type = "string" },
                            publicActivities = BuildTripActivitiesSchema(),
                            personalActivities = BuildTripActivitiesSchema()
                        },
                        required = new[] { "name", "category", "address", "latitude", "longitude", "notes", "startDate", "endDate", "publicActivities", "personalActivities" }
                    }
                },
                personalItems = BuildTripThingsSchema(),
                sharedItems = BuildTripThingsSchema(),
                personalTodos = BuildTripTodosSchema(),
                sharedTodos = BuildTripTodosSchema(),
                personalExpenses = BuildTripExpensesSchema(),
                sharedExpenses = BuildTripExpensesSchema()
            },
            required = new[]
            {
                "title",
                "summary",
                "currencyText",
                "generalRecommendations",
                "assumptions",
                "suggestedStartDate",
                "suggestedEndDate",
                "itinerary",
                "personalItems",
                "sharedItems",
                "personalTodos",
                "sharedTodos",
                "personalExpenses",
                "sharedExpenses"
            }
        };
    }

    private static string NormalizeCurrencyText(string currencyText)
    {
        return CleanOptional(currencyText) ?? string.Empty;
    }

    private static object BuildTripActivitiesSchema()
    {
        return new
        {
            type = "array",
            items = new
            {
                type = "object",
                properties = new
                {
                    activity = new { type = "string" },
                    name = new { type = "string" },
                    notes = new { type = "string" },
                    startDate = new { type = "string" },
                    endDate = new { type = "string" },
                    address = new { type = "string" },
                    latitude = new { type = new[] { "number", "null" } },
                    longitude = new { type = new[] { "number", "null" } }
                },
                required = new[] { "activity", "name", "notes", "startDate", "endDate", "address", "latitude", "longitude" }
            }
        };
    }

    private static decimal? NormalizeLatitude(decimal? value)
    {
        if (!value.HasValue || value.Value < -90m || value.Value > 90m)
        {
            return null;
        }

        return value.Value;
    }

    private static decimal? NormalizeLongitude(decimal? value)
    {
        if (!value.HasValue || value.Value < -180m || value.Value > 180m)
        {
            return null;
        }

        return value.Value;
    }

    private static object BuildTripThingsSchema()
    {
        return new
        {
            type = "array",
            items = new
            {
                type = "object",
                properties = new
                {
                    category = new { type = "string" },
                    name = new { type = "string" },
                    units = new { type = "string" },
                    value = new { type = "number" },
                    notes = new { type = "string" }
                },
                required = new[] { "category", "name", "units", "value", "notes" }
            }
        };
    }

    private static object BuildTripTodosSchema()
    {
        return new
        {
            type = "array",
            items = new
            {
                type = "object",
                properties = new
                {
                    category = new { type = "string" },
                    name = new { type = "string" },
                    notes = new { type = "string" }
                },
                required = new[] { "category", "name", "notes" }
            }
        };
    }

    private static object BuildTripExpensesSchema()
    {
        return new
        {
            type = "array",
            items = new
            {
                type = "object",
                properties = new
                {
                    category = new { type = "string" },
                    name = new { type = "string" },
                    paymentMethod = new { type = "string" },
                    amount = new { type = "number" },
                    notes = new { type = "string" }
                },
                required = new[] { "category", "name", "paymentMethod", "amount", "notes" }
            }
        };
    }

    private static string BuildTripNotesSection(string prompt, TripAiPlanDto plan)
    {
        var lines = new List<string>
        {
            "AI trip recommendations",
            $"Prompt: {prompt}",
            $"Summary: {plan.Summary}"
        };

        if (!string.IsNullOrWhiteSpace(plan.GeneralRecommendations))
        {
            lines.Add("General recommendations:");
            lines.Add(plan.GeneralRecommendations);
        }

        if (plan.Assumptions.Count > 0)
        {
            lines.Add("Assumptions:");
            lines.AddRange(plan.Assumptions.Select(x => $"- {x}"));
        }

        return string.Join("\n", lines.Where(x => !string.IsNullOrWhiteSpace(x)));
    }

    private static DateOnly? ParseDateOnly(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        if (DateOnly.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dateOnly))
        {
            return dateOnly;
        }

        if (DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var dateTime))
        {
            return DateOnly.FromDateTime(dateTime);
        }

        return null;
    }

    private static DateTime? ParseDateTime(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        if (DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var parsed))
        {
            return parsed;
        }

        return null;
    }

    private static DateTime BuildFallbackItineraryStart(DateOnly tripStartDate, int index)
    {
        return tripStartDate.ToDateTime(TimeOnly.MinValue).AddDays(index);
    }

    private static string BuildItineraryKey(string name, DateTime startDate)
    {
        return $"{name.Trim().ToLowerInvariant()}|{startDate:O}";
    }

    private static string BuildActivityKey(TripActivity activity)
    {
        return BuildActivityKey(activity.TripUserId, activity.ItineraryPartId, activity.Name, activity.StartDate);
    }

    private static string BuildActivityKey(Guid? tripUserId, Guid? itineraryPartId, string name, DateTime? startDate)
    {
        var userMarker = tripUserId?.ToString() ?? "public";
        var partMarker = itineraryPartId?.ToString() ?? "none";
        var timeMarker = startDate?.ToString("O") ?? "none";
        return $"{userMarker}|{partMarker}|{name.Trim().ToLowerInvariant()}|{timeMarker}";
    }

    private static string BuildExpenseKey(string name, decimal amount)
    {
        return $"{name.Trim().ToLowerInvariant()}|{amount.ToString(CultureInfo.InvariantCulture)}";
    }

    private static string? CleanOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static string? CleanRequired(string? value)
    {
        var cleaned = CleanOptional(value);
        return string.IsNullOrWhiteSpace(cleaned) ? null : cleaned;
    }

    private static string? BuildExpenseNotes(TripAiExpenseDto expense)
    {
        var category = CleanOptional(expense.Category);
        var notes = CleanOptional(expense.Notes);

        if (category == null)
        {
            return notes;
        }

        if (notes == null)
        {
            return $"Category: {category}";
        }

        return $"Category: {category}\n{notes}";
    }
}
