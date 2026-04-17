using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Web;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Repositories;
using plantour_server.Services.TickerQ;
using plantour_server.Utils;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class StripeService : IPaymentProcessorService
{
    private const string DefaultApiBaseUrl = "https://api.stripe.com/v1/";

    private readonly string _apiKey;
    private readonly string? _portalConfigurationId;
    private readonly HttpClient _httpClient;
    private readonly CurrentUser _currentUser;
    private readonly UsersRepository _usersRepository;
    private readonly PlanRepository _planRepository;
    private readonly SettingsRepository _settingsRepository;
    private readonly UserSettingsRepository _userSettingsRepository;
    private readonly TimeTickerRepository _timeTickerRepository;
    private readonly ServerSettingsService _serverSettingsService;

    public StripeService(
        HttpClient httpClient,
        HttpCurrentUser httpCurrentUser,
        UsersRepository usersRepository,
        PlanRepository planRepository,
        TimeTickerRepository timeTickerRepository,
        UserSettingsRepository userSettingsRepository,
        SettingsRepository settingsRepository,
        ServerSettingsService serverSettingsService,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _currentUser = httpCurrentUser.CurrentUser;
        _usersRepository = usersRepository;
        _planRepository = planRepository;
        _userSettingsRepository = userSettingsRepository;
        _settingsRepository = settingsRepository;
        _timeTickerRepository = timeTickerRepository;
        _serverSettingsService = serverSettingsService;

        _apiKey = configuration["StripeSettings:ApiKey"]
            ?? throw new CustomException("StripeSettings:ApiKey is not configured");

        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            throw new CustomException("Stripe settings are missing (ApiKey)");
        }

        _portalConfigurationId = configuration["StripeSettings:PortalConfigurationId"];

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        _httpClient.DefaultRequestHeaders.Accept.Clear();
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    private async Task EnsureClientConfiguredAsync()
    {
        string apiBaseUrl;

        try
        {
            apiBaseUrl = await _serverSettingsService.GetPaymentProcessorApiBaseUrlAsync();
        }
        catch
        {
            apiBaseUrl = DefaultApiBaseUrl;
        }

        if (string.IsNullOrWhiteSpace(apiBaseUrl) ||
            !Uri.TryCreate(apiBaseUrl, UriKind.Absolute, out var baseUri))
        {
            baseUri = new Uri(DefaultApiBaseUrl);
        }

        if (_httpClient.BaseAddress == null || !Uri.Compare(_httpClient.BaseAddress, baseUri, UriComponents.AbsoluteUri, UriFormat.Unescaped, StringComparison.OrdinalIgnoreCase).Equals(0))
        {
            _httpClient.BaseAddress = baseUri;
        }
    }

    public async Task<bool> ActiveSubscriptionExists(string email)
    {
        return await GetActiveSubscriptionByEmailAsync(email) != null;
    }

    public async Task<string?> GetActiveCustomerIdByEmailAsync(string email)
    {
        await EnsureClientConfiguredAsync();

        var customers = await GetCustomersByEmailAsync(email);
        if (customers.Count == 0)
        {
            return null;
        }

        var orderedCustomers = customers
            .OrderByDescending(x => GetUnixTimestamp(x, "created") ?? 0)
            .ToList();

        foreach (var customer in orderedCustomers)
        {
            var customerId = GetRequiredString(customer, "id", "Stripe customer does not contain id");
            var subscriptions = await GetSubscriptionsByCustomerIdAsync(customerId);

            if (subscriptions.Any(x => IsAccessibleSubscription(x.Status, x.BillingPeriodEnd)))
            {
                return customerId;
            }
        }

        return GetRequiredString(orderedCustomers[0], "id", "Stripe customer does not contain id");
    }

    public async Task<string?> GetActiveCustomerEmailByIdAsync(PaymentProcessorCustomerEmailRequest request)
    {
        await EnsureClientConfiguredAsync();

        if (string.IsNullOrWhiteSpace(request.CustomerId))
        {
            throw new CustomException("CustomerId is required", nameof(request));
        }

        var customer = await GetObjectAsync($"customers/{Uri.EscapeDataString(request.CustomerId)}");
        if (customer == null)
        {
            return null;
        }

        if (customer.Value.TryGetProperty("deleted", out var deletedElement) && deletedElement.ValueKind == JsonValueKind.True)
        {
            return null;
        }

        return GetOptionalString(customer.Value, "email");
    }

    public async Task<PaymentProcessorSubscription?> GetActiveSubscriptionByEmailAsync(string email)
    {
        await EnsureClientConfiguredAsync();

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new CustomException("Email is required");
        }

        var customers = await GetCustomersByEmailAsync(email);
        if (customers.Count == 0)
        {
            return null;
        }

        var subscriptions = new List<PaymentProcessorSubscription>();

        foreach (var customer in customers)
        {
            var customerId = GetRequiredString(customer, "id", "Stripe customer does not contain id");
            var customerSubscriptions = await GetSubscriptionsByCustomerIdAsync(customerId);

            subscriptions.AddRange(customerSubscriptions.Where(x => IsAccessibleSubscription(x.Status, x.BillingPeriodEnd)));
        }

        return subscriptions
            .OrderByDescending(x => GetSortDate(x.BillingPeriodEnd, x.CreatedAt))
            .FirstOrDefault();
    }

    public async Task<string?> GetActiveSubscriptionIdAsync(PaymentProcessorSubscriptionIdRequest request)
    {
        await EnsureClientConfiguredAsync();

        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.PriceId))
        {
            throw new CustomException("Email and PriceId are required");
        }

        var customers = await GetCustomersByEmailAsync(request.Email);
        if (customers.Count == 0)
        {
            return null;
        }

        var subscriptions = new List<PaymentProcessorSubscription>();

        foreach (var customer in customers)
        {
            var customerId = GetRequiredString(customer, "id", "Stripe customer does not contain id");
            var customerSubscriptions = await GetSubscriptionsByCustomerIdAsync(customerId);

            subscriptions.AddRange(customerSubscriptions.Where(x =>
                IsAccessibleSubscription(x.Status, x.BillingPeriodEnd) &&
                string.Equals(x.PriceId, request.PriceId, StringComparison.Ordinal)));
        }

        return subscriptions
            .OrderByDescending(x => GetSortDate(x.BillingPeriodEnd, x.CreatedAt))
            .FirstOrDefault()
            ?.Id;
    }

    public async Task<PaymentProcessorCheckoutResponse> CreateCheckoutSessionAsync(PaymentProcessorCheckoutRequest request)
    {
        await EnsureClientConfiguredAsync();

        if (string.IsNullOrWhiteSpace(request.PriceId))
        {
            throw new CustomException("PriceId is required");
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var existingCustomerId = await GetActiveCustomerIdByEmailAsync(request.Email);
            if (!string.IsNullOrWhiteSpace(existingCustomerId))
            {
                throw new CustomException("This email is already registered in the payment system. Please sign in with that email or use a different email address.");
            }
        }

        var successUrl = await BuildSuccessUrlAsync(request.RedirectUrl);
        var cancelUrl = await BuildCancelUrlAsync(request.RedirectUrl, successUrl);

        var form = new List<KeyValuePair<string, string>>
        {
            new("mode", "subscription"),
            new("line_items[0][price]", request.PriceId.Trim()),
            new("line_items[0][quantity]", "1"),
            new("success_url", successUrl),
            new("cancel_url", cancelUrl)
        };

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            form.Add(new("customer_email", request.Email.Trim()));
        }

        var session = await PostFormAsync("checkout/sessions", form);
        var url = GetOptionalString(session, "url");

        if (string.IsNullOrWhiteSpace(url))
        {
            throw new CustomException("Stripe checkout session URL is missing");
        }

        return new PaymentProcessorCheckoutResponse
        {
            Url = url
        };
    }

    public async Task<PortalSessionResponse> CreateCustomerPortalSessionAsync()
    {
        await EnsureClientConfiguredAsync();

        PaymentProcessorSubscription? subscription = null;

        if (!string.IsNullOrWhiteSpace(_currentUser.PaymentProcessorSubscriptionId))
        {
            subscription = await GetActiveSubscriptionByIdAsync(_currentUser.PaymentProcessorSubscriptionId);
        }

        subscription ??= await GetActiveSubscriptionByEmailAsync(_currentUser.Email);

        if (subscription == null)
        {
            throw new CustomException("Stripe subscription not found for the current user");
        }

        var form = new List<KeyValuePair<string, string>>
        {
            new("customer", subscription.CustomerId)
        };

        if (!string.IsNullOrWhiteSpace(_portalConfigurationId))
        {
            form.Add(new("configuration", _portalConfigurationId.Trim()));
        }

        var returnUrl = await GetDefaultPortalReturnUrlAsync();
        if (!string.IsNullOrWhiteSpace(returnUrl))
        {
            form.Add(new("return_url", returnUrl));
        }

        var session = await PostFormAsync("billing_portal/sessions", form);
        var url = GetOptionalString(session, "url");

        if (string.IsNullOrWhiteSpace(url))
        {
            throw new CustomException("Stripe billing portal URL is missing");
        }

        return new PortalSessionResponse
        {
            Url = url
        };
    }

    public async Task<IEnumerable<PaymentProcessorProduct>?> GetActiveProductsAsync()
    {
        await EnsureClientConfiguredAsync();

        var prices = await GetArrayAsync("prices?active=true&type=recurring&limit=100&expand[]=data.product");
        if (prices.Count == 0)
        {
            return null;
        }

        var products = new Dictionary<string, PaymentProcessorProduct>(StringComparer.Ordinal);

        foreach (var priceElement in prices)
        {
            if (!priceElement.TryGetProperty("product", out var productElement) || productElement.ValueKind != JsonValueKind.Object)
            {
                continue;
            }

            if (productElement.TryGetProperty("active", out var productActiveElement) && productActiveElement.ValueKind == JsonValueKind.False)
            {
                continue;
            }

            var productId = GetRequiredString(productElement, "id", "Stripe product does not contain id");
            if (!products.TryGetValue(productId, out var paymentProduct))
            {
                paymentProduct = new PaymentProcessorProduct
                {
                    Id = productId,
                    Name = GetOptionalString(productElement, "name") ?? productId,
                    Description = GetOptionalString(productElement, "description") ?? string.Empty,
                    Prices = new List<PaymentProcessorPrice>()
                };

                products[productId] = paymentProduct;
            }

            if (!priceElement.TryGetProperty("recurring", out var recurringElement) || recurringElement.ValueKind != JsonValueKind.Object)
            {
                continue;
            }

            var priceId = GetRequiredString(priceElement, "id", "Stripe price does not contain id");
            var priceName = await _planRepository.GetPaymentProcessorPriceNameByIdAsync(priceId)
                ?? GetOptionalString(priceElement, "nickname")
                ?? priceId;

            paymentProduct.Prices.Add(new PaymentProcessorPrice
            {
                Id = priceId,
                ProductId = productId,
                Name = priceName,
                Description = GetOptionalString(priceElement, "nickname") ?? string.Empty,
                Type = GetOptionalString(priceElement, "type") ?? "recurring",
                BillingCycleInterval = GetOptionalString(recurringElement, "interval") ?? "month",
                BillingCycleFrequency = GetOptionalInt(recurringElement, "interval_count") ?? 1,
                UnitPriceAmount = GetOptionalInt(priceElement, "unit_amount") ?? 0
            });
        }

        return products.Values
            .Where(x => x.Prices.Count > 0)
            .Select(x =>
            {
                x.Prices = x.Prices.OrderBy(p => p.UnitPriceAmount).ToList();
                return x;
            })
            .ToList();
    }

    public async Task UpgradePlanPriceAsync(string oldPlanPrice, string newPlanPrice)
    {
        await EnsureClientConfiguredAsync();

        if (!_currentUser.IsAdmin)
        {
            throw new CustomException("Only admins can change plan prices");
        }

        await ChangePlanPriceAsync(_currentUser.AdminId, oldPlanPrice, newPlanPrice, false);
    }

    public async Task ScheduleDowngradePlanPriceAsync(Guid userId, string oldPlanPrice, string newPlanPrice)
    {
        await EnsureClientConfiguredAsync();
        await CancelLegacyScheduledDowngradeAsync(userId);

        var context = await BuildPlanChangeContextAsync(userId, oldPlanPrice, newPlanPrice, true);
        await ReleaseScheduleIfExistsAsync(context.ScheduleId);

        var createdSchedule = await PostFormAsync("subscription_schedules", new[]
        {
            new KeyValuePair<string, string>("from_subscription", context.Subscription.Id)
        });

        var scheduleId = GetRequiredString(createdSchedule, "id", "Stripe subscription schedule does not contain id");

        var form = new List<KeyValuePair<string, string>>
        {
            new("end_behavior", "release"),
            new("proration_behavior", "none"),
            new("phases[0][items][0][price]", context.OldPrice.Id),
            new("phases[0][items][0][quantity]", context.Quantity.ToString(CultureInfo.InvariantCulture)),
            new("phases[0][start_date]", context.CurrentPeriodStartUnix.ToString(CultureInfo.InvariantCulture)),
            new("phases[0][end_date]", context.CurrentPeriodEndUnix.ToString(CultureInfo.InvariantCulture)),
            new("phases[1][items][0][price]", context.NewPrice.Id),
            new("phases[1][items][0][quantity]", context.Quantity.ToString(CultureInfo.InvariantCulture)),
            new("phases[1][start_date]", context.CurrentPeriodEndUnix.ToString(CultureInfo.InvariantCulture)),
            new("phases[1][proration_behavior]", "none")
        };

        await PostFormAsync($"subscription_schedules/{Uri.EscapeDataString(scheduleId)}", form);
    }

    public async Task DowngradePlanPriceAsync(Guid userId, string oldPlanPrice, string newPlanPrice)
    {
        await EnsureClientConfiguredAsync();
        await ChangePlanPriceAsync(userId, oldPlanPrice, newPlanPrice, true);
    }

    public async Task<ScheduledPlanDowngradeInfoDto> GetScheduledPlanDowngradeInfoAsync(Guid userId)
    {
        await EnsureClientConfiguredAsync();

        var subscription = await GetActiveSubscriptionByUserIdAsync(userId, UserRole.Admin, userId);

        if (subscription == null)
        {
            return new ScheduledPlanDowngradeInfoDto
            {
                HasScheduledDowngrade = false
            };
        }

        var subscriptionJson = await GetObjectAsync($"subscriptions/{Uri.EscapeDataString(subscription.Id)}")
            ?? throw new CustomException("Stripe subscription not found");

        var scheduleId = GetOptionalString(subscriptionJson, "schedule");
        if (string.IsNullOrWhiteSpace(scheduleId))
        {
            return new ScheduledPlanDowngradeInfoDto
            {
                HasScheduledDowngrade = false,
                CurrentBillingPeriodEnd = subscription.BillingPeriodEnd
            };
        }

        var schedule = await GetObjectAsync($"subscription_schedules/{Uri.EscapeDataString(scheduleId)}");
        return schedule == null
            ? new ScheduledPlanDowngradeInfoDto
            {
                HasScheduledDowngrade = false,
                CurrentBillingPeriodEnd = subscription.BillingPeriodEnd
            }
            : await MapScheduledDowngradeInfoAsync(schedule.Value, subscription.PriceName, subscription.BillingPeriodEnd);
    }

    public async Task<bool> CancelScheduledPlanDowngradeAsync(Guid userId)
    {
        await EnsureClientConfiguredAsync();
        var cancelledLegacy = await CancelLegacyScheduledDowngradeAsync(userId);

        var subscription = await GetActiveSubscriptionByUserIdAsync(userId, UserRole.Admin, userId);

        if (subscription == null)
        {
            return cancelledLegacy;
        }

        var subscriptionJson = await GetObjectAsync($"subscriptions/{Uri.EscapeDataString(subscription.Id)}");
        if (subscriptionJson == null)
        {
            return cancelledLegacy;
        }

        var scheduleId = GetOptionalString(subscriptionJson.Value, "schedule");
        var cancelledSchedule = await ReleaseScheduleIfExistsAsync(scheduleId);
        return cancelledLegacy || cancelledSchedule;
    }

    private async Task ChangePlanPriceAsync(Guid userId, string oldPlanPrice, string newPlanPrice, bool isDowngrade)
    {
        await CancelLegacyScheduledDowngradeAsync(userId);
        var context = await BuildPlanChangeContextAsync(userId, oldPlanPrice, newPlanPrice, isDowngrade);
        await ReleaseScheduleIfExistsAsync(context.ScheduleId);

        var form = new List<KeyValuePair<string, string>>
        {
            new("items[0][id]", context.SubscriptionItemId),
            new("items[0][price]", context.NewPrice.Id),
            new("items[0][quantity]", context.Quantity.ToString(CultureInfo.InvariantCulture)),
            new("proration_behavior", isDowngrade ? "none" : "create_prorations")
        };

        await PostFormAsync($"subscriptions/{Uri.EscapeDataString(context.Subscription.Id)}", form);

        if (isDowngrade)
        {
            return;
        }

        var days = (int)await _settingsRepository.GetSettingByKey("user_entities_logging_days");
        DateTime start = DateTime.UtcNow;
        DateTime end = start.AddDays(days);
        await _userSettingsRepository.SetUserEntitiesLogging(userId, start, end);
    }

    private Task<bool> CancelLegacyScheduledDowngradeAsync(Guid userId)
    {
        return _timeTickerRepository.CancelLatestActiveByFunctionAndIdentifierAsync(
            TickerQPlanDowngradeTask.FunctionName,
            userId.ToString());
    }

    private async Task<StripePlanChangeContext> BuildPlanChangeContextAsync(Guid userId, string oldPlanPrice, string newPlanPrice, bool isDowngrade)
    {
        var user = await _usersRepository.GetActiveByIdAsync(userId) ?? throw new CustomException("User not found");
        var products = await GetActiveProductsAsync();
        var prices = products?.SelectMany(x => x.Prices).OrderBy(x => x.UnitPriceAmount).ToList();

        var oldPrice = prices?.FirstOrDefault(x => x.Name.Equals(oldPlanPrice, StringComparison.OrdinalIgnoreCase))
            ?? throw new CustomException($"Old plan price '{oldPlanPrice}' not found");

        var newPrice = prices?.FirstOrDefault(x => x.Name.Equals(newPlanPrice, StringComparison.OrdinalIgnoreCase))
            ?? throw new CustomException($"New plan price '{newPlanPrice}' not found");

        if (isDowngrade)
        {
            if (oldPrice.UnitPriceAmount < newPrice.UnitPriceAmount)
            {
                throw new CustomException($"Old plan price '{oldPlanPrice}' is cheaper than new plan price '{newPlanPrice}', cannot downgrade");
            }
        }
        else if (oldPrice.UnitPriceAmount > newPrice.UnitPriceAmount)
        {
            throw new CustomException($"Old plan price '{oldPlanPrice}' is more expensive than new plan price '{newPlanPrice}', cannot upgrade");
        }

        var subscription = await GetActiveSubscriptionByEmailAsync(user.Email)
            ?? throw new CustomException("No active subscription found for the user with email " + user.Email);

        if (subscription.PriceId != oldPrice.Id)
        {
            throw new CustomException($"Current subscription price ID '{subscription.PriceId}' does not match the expected old price ID '{oldPrice.Id}' for the user with email " + user.Email + ")");
        }

        var subscriptionJson = await GetObjectAsync($"subscriptions/{Uri.EscapeDataString(subscription.Id)}?expand[]=items.data.price")
            ?? throw new CustomException("Stripe subscription not found");

        if (!subscriptionJson.TryGetProperty("items", out var itemsElement) ||
            !itemsElement.TryGetProperty("data", out var itemsDataElement) ||
            itemsDataElement.ValueKind != JsonValueKind.Array)
        {
            throw new CustomException("Stripe subscription does not contain items.data");
        }

        var matchingItem = itemsDataElement.EnumerateArray().FirstOrDefault(item =>
        {
            if (!item.TryGetProperty("price", out var priceElement))
            {
                return false;
            }

            if (priceElement.ValueKind == JsonValueKind.Object)
            {
                return string.Equals(GetOptionalString(priceElement, "id"), oldPrice.Id, StringComparison.Ordinal);
            }

            return priceElement.ValueKind == JsonValueKind.String &&
                string.Equals(priceElement.GetString(), oldPrice.Id, StringComparison.Ordinal);
        });

        if (matchingItem.ValueKind == JsonValueKind.Undefined)
        {
            throw new CustomException("Stripe subscription item for the current plan was not found");
        }

        var subscriptionItemId = GetRequiredString(matchingItem, "id", "Stripe subscription item does not contain id");
        var quantity = GetOptionalInt(matchingItem, "quantity") ?? 1;
        var itemPeriodRange = GetSubscriptionItemCurrentPeriodRange(matchingItem);
        var currentPeriodStart = itemPeriodRange.startDate ?? GetUnixTimestamp(subscriptionJson, "current_period_start")
            ?? throw new CustomException("Stripe subscription does not contain current_period_start");
        var currentPeriodEnd = itemPeriodRange.endDate ?? GetUnixTimestamp(subscriptionJson, "current_period_end")
            ?? throw new CustomException("Stripe subscription does not contain current_period_end");

        return new StripePlanChangeContext(
            subscription,
            oldPrice,
            newPrice,
            subscriptionItemId,
            quantity,
            currentPeriodStart,
            currentPeriodEnd,
            GetOptionalString(subscriptionJson, "schedule"));
    }

    private async Task<bool> ReleaseScheduleIfExistsAsync(string? scheduleId)
    {
        if (string.IsNullOrWhiteSpace(scheduleId))
        {
            return false;
        }

        var schedule = await GetObjectAsync($"subscription_schedules/{Uri.EscapeDataString(scheduleId)}");
        if (schedule == null)
        {
            return false;
        }

        var status = GetOptionalString(schedule.Value, "status");
        if (!string.Equals(status, "active", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(status, "not_started", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        await PostFormAsync($"subscription_schedules/{Uri.EscapeDataString(scheduleId)}/release", Array.Empty<KeyValuePair<string, string>>());
        return true;
    }

    private async Task<ScheduledPlanDowngradeInfoDto> MapScheduledDowngradeInfoAsync(JsonElement schedule, string currentPlanPriceName, string? currentBillingPeriodEnd)
    {
        var status = GetOptionalString(schedule, "status");
        if (!string.Equals(status, "active", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(status, "not_started", StringComparison.OrdinalIgnoreCase))
        {
            return new ScheduledPlanDowngradeInfoDto
            {
                HasScheduledDowngrade = false,
                CurrentBillingPeriodEnd = currentBillingPeriodEnd
            };
        }

        if (!schedule.TryGetProperty("phases", out var phasesElement) || phasesElement.ValueKind != JsonValueKind.Array)
        {
            return new ScheduledPlanDowngradeInfoDto
            {
                HasScheduledDowngrade = false,
                CurrentBillingPeriodEnd = currentBillingPeriodEnd
            };
        }

        var phases = phasesElement.EnumerateArray().ToList();
        if (phases.Count < 2)
        {
            return new ScheduledPlanDowngradeInfoDto
            {
                HasScheduledDowngrade = false,
                CurrentBillingPeriodEnd = currentBillingPeriodEnd
            };
        }

        var currentPhase = schedule.TryGetProperty("current_phase", out var currentPhaseElement) && currentPhaseElement.ValueKind == JsonValueKind.Object
            ? currentPhaseElement
            : default;

        long? currentPhaseEnd = currentPhase.ValueKind == JsonValueKind.Object
            ? GetUnixTimestamp(currentPhase, "end_date")
            : null;

        JsonElement? nextPhase = null;
        foreach (var phase in phases)
        {
            var startDate = GetUnixTimestamp(phase, "start_date");
            if (!startDate.HasValue)
            {
                continue;
            }

            if (!currentPhaseEnd.HasValue || startDate.Value >= currentPhaseEnd.Value)
            {
                nextPhase = phase;
                break;
            }
        }

        if (!nextPhase.HasValue)
        {
            return new ScheduledPlanDowngradeInfoDto
            {
                HasScheduledDowngrade = false,
                CurrentBillingPeriodEnd = currentBillingPeriodEnd
            };
        }

        var nextPriceId = GetPhasePriceId(nextPhase.Value);
        if (string.IsNullOrWhiteSpace(nextPriceId))
        {
            return new ScheduledPlanDowngradeInfoDto
            {
                HasScheduledDowngrade = false,
                CurrentBillingPeriodEnd = currentBillingPeriodEnd
            };
        }

        var newPlanPrice = await _planRepository.GetPaymentProcessorPriceNameByIdAsync(nextPriceId)
            ?? nextPriceId;

        return new ScheduledPlanDowngradeInfoDto
        {
            HasScheduledDowngrade = true,
            CurrentBillingPeriodEnd = currentBillingPeriodEnd,
            JobId = GetOptionalString(schedule, "id"),
            CreatedAt = UnixToIsoString(GetUnixTimestamp(schedule, "created")),
            ExecutionTime = UnixToIsoString(GetUnixTimestamp(nextPhase.Value, "start_date")),
            OldPlanPrice = currentPlanPriceName,
            NewPlanPrice = newPlanPrice
        };
    }

    private static string? GetPhasePriceId(JsonElement phase)
    {
        if (!phase.TryGetProperty("items", out var itemsElement) ||
            itemsElement.ValueKind != JsonValueKind.Array ||
            itemsElement.GetArrayLength() == 0)
        {
            return null;
        }

        var item = itemsElement[0];
        if (!item.TryGetProperty("price", out var priceElement))
        {
            return null;
        }

        return priceElement.ValueKind switch
        {
            JsonValueKind.String => priceElement.GetString(),
            JsonValueKind.Object => GetOptionalString(priceElement, "id"),
            _ => null
        };
    }

    public async Task<PaymentProcessorSubscription?> GetActiveSubscriptionByUserIdAsync(Guid userId, UserRole role, Guid adminId)
    {
        await EnsureClientConfiguredAsync();

        var user = await _usersRepository.GetActiveByIdAsync(userId);
        if (user == null)
        {
            return null;
        }

        return await GetActiveSubscriptionByUserAsync(user, role, adminId);
    }

    public async Task<PaymentProcessorSubscription?> GetActiveSubscriptionByUserAsync(User user, UserRole role, Guid adminId)
    {
        await EnsureClientConfiguredAsync();

        if (user == null)
        {
            throw new CustomException("User is required");
        }

        PaymentProcessorSubscription? subscription = null;
        var admin = user;

        if (role == UserRole.Participant)
        {
            admin = await _usersRepository.GetActiveByIdAsync(adminId) ?? throw new CustomException("Admin user not found");
        }

        if (!string.IsNullOrWhiteSpace(admin.PaymentProcessorSubscriptionId))
        {
            subscription = await GetActiveSubscriptionByIdAsync(admin.PaymentProcessorSubscriptionId);
        }

        if (subscription == null)
        {
            subscription = await GetActiveSubscriptionByEmailAsync(admin.Email);
        }

        if (subscription == null)
        {
            if (!string.IsNullOrWhiteSpace(admin.PaymentProcessorSubscriptionId))
            {
                admin.PaymentProcessorSubscriptionId = null;
                await _usersRepository.UpdateAsync(admin);
            }

            return null;
        }

        if (admin.PaymentProcessorSubscriptionId != subscription.Id)
        {
            admin.PaymentProcessorSubscriptionId = subscription.Id;
            await _usersRepository.UpdateAsync(admin);
        }

        DateTime start1 = DateTime.Parse(subscription.StartedAt, null, DateTimeStyles.AdjustToUniversal);
        var days = (int)await _settingsRepository.GetSettingByKey("user_entities_logging_days");
        DateTime end1 = start1.AddDays(days);

        DateTime start2 = DateTime.UtcNow;
        DateTime end2 = start2.AddDays(days);

        bool isOverlapping = (start1 < end2) && (start2 < end1);

        if (isOverlapping)
        {
            DateTime overlapStart = start1 > start2 ? start1 : start2;
            DateTime overlapEnd = end1 < end2 ? end1 : end2;

            StartEndDates? existingSettings = await _userSettingsRepository.GetUserEntitiesLogging(admin.Id);
            bool updateNeeded = existingSettings == null ||
            (
                existingSettings.Start > overlapStart ||
                existingSettings.End < overlapEnd
            );

            if (updateNeeded)
            {
                await _userSettingsRepository.SetUserEntitiesLogging(admin.Id, overlapStart.AddDays(-1), overlapEnd.AddDays(1));
            }
        }

        return subscription;
    }

    private async Task<PaymentProcessorSubscription?> GetActiveSubscriptionByIdAsync(string subscriptionId)
    {
        if (string.IsNullOrWhiteSpace(subscriptionId))
        {
            throw new CustomException("SubscriptionId is required");
        }

        var subscriptionJson = await GetObjectAsync($"subscriptions/{Uri.EscapeDataString(subscriptionId)}");
        if (subscriptionJson == null)
        {
            return null;
        }

        var subscription = await JsonToSubscriptionAsync(subscriptionJson.Value);
        return IsAccessibleSubscription(subscription.Status, subscription.BillingPeriodEnd)
            ? subscription
            : null;
    }

    private async Task<List<JsonElement>> GetCustomersByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new CustomException("Email is required");
        }

        return await GetArrayAsync($"customers?email={Uri.EscapeDataString(email)}&limit=100");
    }

    private async Task<List<PaymentProcessorSubscription>> GetSubscriptionsByCustomerIdAsync(string customerId)
    {
        var subscriptions = await GetArrayAsync($"subscriptions?customer={Uri.EscapeDataString(customerId)}&status=all&limit=100");
        var mapped = new List<PaymentProcessorSubscription>();

        foreach (var subscriptionJson in subscriptions)
        {
            mapped.Add(await JsonToSubscriptionAsync(subscriptionJson));
        }

        return mapped;
    }

    private async Task<PaymentProcessorSubscription> JsonToSubscriptionAsync(JsonElement subscriptionJson)
    {
        var subscriptionId = GetRequiredString(subscriptionJson, "id", "Stripe subscription does not contain id");
        var status = GetRequiredString(subscriptionJson, "status", "Stripe subscription does not contain status");
        var customerId = GetRequiredObjectId(subscriptionJson, "customer", "Stripe subscription does not contain customer");

        if (!subscriptionJson.TryGetProperty("items", out var itemsElement) ||
            !itemsElement.TryGetProperty("data", out var itemsDataElement) ||
            itemsDataElement.ValueKind != JsonValueKind.Array ||
            itemsDataElement.GetArrayLength() == 0)
        {
            throw new CustomException("Stripe subscription does not contain items.data");
        }

        var firstItem = itemsDataElement[0];
        if (!firstItem.TryGetProperty("price", out var priceElement))
        {
            throw new CustomException("Stripe subscription item does not contain price");
        }

        string priceId;
        string? priceFallbackName = null;

        if (priceElement.ValueKind == JsonValueKind.Object)
        {
            priceId = GetRequiredString(priceElement, "id", "Stripe price does not contain id");
            priceFallbackName = GetOptionalString(priceElement, "nickname");
        }
        else if (priceElement.ValueKind == JsonValueKind.String)
        {
            priceId = priceElement.GetString() ?? throw new CustomException("Stripe price id is missing");
        }
        else
        {
            throw new CustomException("Stripe subscription price has an unsupported shape");
        }

        var priceName = await _planRepository.GetPaymentProcessorPriceNameByIdAsync(priceId)
            ?? priceFallbackName
            ?? priceId;

        var createdAt = GetUnixTimestamp(subscriptionJson, "created");
        var startDate = GetUnixTimestamp(subscriptionJson, "start_date") ?? createdAt;
        var itemPeriodRange = GetSubscriptionItemCurrentPeriodRange(firstItem);
        var currentPeriodStart = itemPeriodRange.startDate ?? GetUnixTimestamp(subscriptionJson, "current_period_start");
        var currentPeriodEnd = itemPeriodRange.endDate ?? GetUnixTimestamp(subscriptionJson, "current_period_end");

        var scheduleId = GetOptionalString(subscriptionJson, "schedule");

        if ((!currentPeriodStart.HasValue || !currentPeriodEnd.HasValue) && !string.IsNullOrWhiteSpace(scheduleId))
        {
            var schedulePhase = await GetScheduleCurrentPhaseAsync(scheduleId);
            currentPeriodStart ??= schedulePhase.startDate;
            currentPeriodEnd ??= schedulePhase.endDate;
        }

        return new PaymentProcessorSubscription
        {
            Id = subscriptionId,
            Status = status,
            CustomerId = customerId,
            PriceId = priceId,
            CreatedAt = UnixToIsoString(createdAt) ?? throw new CustomException("Stripe subscription does not contain created timestamp"),
            PriceName = priceName,
            BillingPeriodStart = UnixToIsoString(currentPeriodStart),
            BillingPeriodEnd = UnixToIsoString(currentPeriodEnd),
            StartedAt = UnixToIsoString(startDate) ?? throw new CustomException("Stripe subscription does not contain start timestamp")
        };
    }

    private async Task<(long? startDate, long? endDate)> GetScheduleCurrentPhaseAsync(string scheduleId)
    {
        if (string.IsNullOrWhiteSpace(scheduleId))
        {
            return (null, null);
        }

        var schedule = await GetObjectAsync($"subscription_schedules/{Uri.EscapeDataString(scheduleId)}");
        if (schedule == null)
        {
            return (null, null);
        }

        if (!schedule.Value.TryGetProperty("current_phase", out var currentPhase) || currentPhase.ValueKind != JsonValueKind.Object)
        {
            return (null, null);
        }

        return (
            GetUnixTimestamp(currentPhase, "start_date"),
            GetUnixTimestamp(currentPhase, "end_date"));
    }

    private static (long? startDate, long? endDate) GetSubscriptionItemCurrentPeriodRange(JsonElement subscriptionItem)
    {
        return (
            GetUnixTimestamp(subscriptionItem, "current_period_start"),
            GetUnixTimestamp(subscriptionItem, "current_period_end"));
    }

    private async Task<List<JsonElement>> GetArrayAsync(string path)
    {
        var results = new List<JsonElement>();
        string? nextStartingAfter = null;

        while (true)
        {
            var requestPath = path;
            if (!string.IsNullOrWhiteSpace(nextStartingAfter))
            {
                requestPath += requestPath.Contains('?', StringComparison.Ordinal) ? "&" : "?";
                requestPath += $"starting_after={Uri.EscapeDataString(nextStartingAfter)}";
            }

            using var response = await SendAsync(HttpMethod.Get, requestPath);
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return results;
            }

            var json = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(json);

            if (!document.RootElement.TryGetProperty("data", out var dataElement) || dataElement.ValueKind != JsonValueKind.Array)
            {
                throw new CustomException("Stripe response does not contain a data array");
            }

            var page = dataElement.EnumerateArray().Select(x => x.Clone()).ToList();
            results.AddRange(page);

            var hasMore = document.RootElement.TryGetProperty("has_more", out var hasMoreElement) &&
                hasMoreElement.ValueKind == JsonValueKind.True;

            if (!hasMore || page.Count == 0)
            {
                return results;
            }

            nextStartingAfter = GetRequiredString(page[^1], "id", "Stripe list item does not contain id");
        }
    }

    private async Task<JsonElement?> GetObjectAsync(string path)
    {
        using var response = await SendAsync(HttpMethod.Get, path);
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);
        return document.RootElement.Clone();
    }

    private async Task<JsonElement> PostFormAsync(string path, IEnumerable<KeyValuePair<string, string>> formValues)
    {
        using var response = await SendAsync(HttpMethod.Post, path, new FormUrlEncodedContent(formValues));
        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);
        return document.RootElement.Clone();
    }

    private async Task<HttpResponseMessage> SendAsync(HttpMethod method, string path, HttpContent? content = null)
    {
        await EnsureClientConfiguredAsync();

        var request = new HttpRequestMessage(method, path)
        {
            Content = content
        };

        var response = await _httpClient.SendAsync(request);
        if (response.StatusCode == HttpStatusCode.NotFound || response.IsSuccessStatusCode)
        {
            return response;
        }

        var errorMessage = await GetErrorMessageAsync(response);
        response.Dispose();
        throw new CustomException(errorMessage);
    }

    private async Task<string> BuildSuccessUrlAsync(string? redirectUrl)
    {
        var normalized = await NormalizeRedirectUrlAsync(redirectUrl);
        if (string.IsNullOrWhiteSpace(normalized))
        {
            normalized = await BuildDefaultRedirectUrlAsync("/sign-in");
        }

        var builder = new UriBuilder(normalized);
        var query = HttpUtility.ParseQueryString(builder.Query);
        query["checkout"] = "success";
        query["sessionId"] = "{CHECKOUT_SESSION_ID}";
        builder.Query = query.ToString() ?? string.Empty;
        return builder.Uri.ToString();
    }

    private async Task<string> BuildCancelUrlAsync(string? redirectUrl, string successUrl)
    {
        var normalized = await NormalizeRedirectUrlAsync(redirectUrl);
        if (string.IsNullOrWhiteSpace(normalized))
        {
            return successUrl;
        }

        var builder = new UriBuilder(normalized);
        var query = HttpUtility.ParseQueryString(builder.Query);
        query["checkout"] = "canceled";
        builder.Query = query.ToString() ?? string.Empty;
        return builder.Uri.ToString();
    }

    private async Task<string?> NormalizeRedirectUrlAsync(string? redirectUrl)
    {
        if (string.IsNullOrWhiteSpace(redirectUrl))
        {
            return null;
        }

        if (!Uri.TryCreate(redirectUrl, UriKind.Absolute, out var redirectUri) ||
            (redirectUri.Scheme != Uri.UriSchemeHttp && redirectUri.Scheme != Uri.UriSchemeHttps))
        {
            throw new CustomException("RedirectUrl must be a valid absolute URL.");
        }

        var allowedOrigins = await _serverSettingsService.GetCorsAllowedOriginsAsync();
        var redirectOrigin = redirectUri.GetLeftPart(UriPartial.Authority);
        var isAllowedOrigin = allowedOrigins.Any(origin =>
        {
            if (!Uri.TryCreate(origin, UriKind.Absolute, out var allowedUri))
            {
                return false;
            }

            return string.Equals(
                allowedUri.GetLeftPart(UriPartial.Authority),
                redirectOrigin,
                StringComparison.OrdinalIgnoreCase);
        });

        if (!isAllowedOrigin)
        {
            throw new CustomException("RedirectUrl origin is not allowed.");
        }

        return redirectUri.ToString();
    }

    private async Task<string> BuildDefaultRedirectUrlAsync(string path)
    {
        var allowedOrigins = await _serverSettingsService.GetCorsAllowedOriginsAsync();
        var origin = allowedOrigins.FirstOrDefault();

        if (string.IsNullOrWhiteSpace(origin))
        {
            throw new CustomException("No allowed origins are configured for payment redirects.");
        }

        return origin.TrimEnd('/') + path;
    }

    private async Task<string?> GetDefaultPortalReturnUrlAsync()
    {
        try
        {
            return await BuildDefaultRedirectUrlAsync("/profile");
        }
        catch
        {
            return null;
        }
    }

    private static bool IsAccessibleSubscription(string status, string? billingPeriodEnd)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return false;
        }

        if (status.Equals("active", StringComparison.OrdinalIgnoreCase) ||
            status.Equals("trialing", StringComparison.OrdinalIgnoreCase) ||
            status.Equals("past_due", StringComparison.OrdinalIgnoreCase) ||
            status.Equals("unpaid", StringComparison.OrdinalIgnoreCase) ||
            status.Equals("paused", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (!status.Equals("canceled", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var endDate = ParseDateTime(billingPeriodEnd);
        return !endDate.HasValue || endDate.Value >= DateTime.UtcNow;
    }

    private static DateTime GetSortDate(string? billingPeriodEnd, string createdAt)
    {
        return ParseDateTime(billingPeriodEnd) ?? ParseDateTime(createdAt) ?? DateTime.MinValue;
    }

    private static DateTime? ParseDateTime(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return DateTime.TryParse(value, null, DateTimeStyles.AdjustToUniversal, out var parsed)
            ? parsed
            : null;
    }

    private static long? GetUnixTimestamp(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var property))
        {
            return null;
        }

        if (property.ValueKind == JsonValueKind.Number && property.TryGetInt64(out var numberValue))
        {
            return numberValue;
        }

        if (property.ValueKind == JsonValueKind.String && long.TryParse(property.GetString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var stringValue))
        {
            return stringValue;
        }

        return null;
    }

    private sealed record StripePlanChangeContext(
        PaymentProcessorSubscription Subscription,
        PaymentProcessorPrice OldPrice,
        PaymentProcessorPrice NewPrice,
        string SubscriptionItemId,
        int Quantity,
        long CurrentPeriodStartUnix,
        long CurrentPeriodEndUnix,
        string? ScheduleId);

    private static string? UnixToIsoString(long? unixTimestamp)
    {
        if (!unixTimestamp.HasValue)
        {
            return null;
        }

        return DateTimeOffset.FromUnixTimeSeconds(unixTimestamp.Value).UtcDateTime.ToString("O", CultureInfo.InvariantCulture);
    }

    private static string GetRequiredObjectId(JsonElement element, string propertyName, string errorMessage)
    {
        if (!element.TryGetProperty(propertyName, out var property))
        {
            throw new CustomException(errorMessage);
        }

        if (property.ValueKind == JsonValueKind.String)
        {
            var stringValue = property.GetString();
            if (!string.IsNullOrWhiteSpace(stringValue))
            {
                return stringValue;
            }
        }

        if (property.ValueKind == JsonValueKind.Object)
        {
            return GetRequiredString(property, "id", errorMessage);
        }

        throw new CustomException(errorMessage);
    }

    private static string GetRequiredString(JsonElement element, string propertyName, string errorMessage)
    {
        var value = GetOptionalString(element, propertyName);
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new CustomException(errorMessage);
        }

        return value;
    }

    private static string? GetOptionalString(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var property))
        {
            return null;
        }

        return property.ValueKind switch
        {
            JsonValueKind.String => property.GetString(),
            JsonValueKind.Number => property.GetRawText(),
            _ => null
        };
    }

    private static int? GetOptionalInt(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var property))
        {
            return null;
        }

        if (property.ValueKind == JsonValueKind.Number && property.TryGetInt32(out var intValue))
        {
            return intValue;
        }

        if (property.ValueKind == JsonValueKind.String && int.TryParse(property.GetString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed))
        {
            return parsed;
        }

        return null;
    }

    private static async Task<string> GetErrorMessageAsync(HttpResponseMessage response)
    {
        var responseText = await response.Content.ReadAsStringAsync();
        var fallbackMessage = $"Stripe request failed with status {(int)response.StatusCode} ({response.ReasonPhrase})";

        if (string.IsNullOrWhiteSpace(responseText))
        {
            return fallbackMessage;
        }

        try
        {
            using var document = JsonDocument.Parse(responseText);
            if (document.RootElement.TryGetProperty("error", out var errorElement))
            {
                var message = GetOptionalString(errorElement, "message");
                if (!string.IsNullOrWhiteSpace(message))
                {
                    return message;
                }
            }
        }
        catch
        {
        }

        return fallbackMessage;
    }
}