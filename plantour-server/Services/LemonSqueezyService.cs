using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Web;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Repositories;
using plantour_server.Utils;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class LemonSqueezyService : IPaymentProcessorService
{
    private const string DefaultApiBaseUrl = "https://api.lemonsqueezy.com/v1/";

    private readonly string _apiKey;
    private readonly HttpClient _httpClient;
    private readonly CurrentUser _currentUser;
    private readonly UsersRepository _usersRepository;
    private readonly PlanRepository _planRepository;
    private readonly TimeTickerRepository _timeTickerRepository;
    private readonly UserSettingsRepository _userSettingsRepository;
    private readonly SettingsRepository _settingsRepository;
    private readonly ServerSettingsService _serverSettingsService;

    public LemonSqueezyService(
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
        _timeTickerRepository = timeTickerRepository;
        _userSettingsRepository = userSettingsRepository;
        _settingsRepository = settingsRepository;
        _serverSettingsService = serverSettingsService;

        _apiKey = configuration["LemonSqueezySettings:ApiKey"]
            ?? throw new CustomException("LemonSqueezySettings:ApiKey is not configured");

        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            throw new CustomException("Lemon Squeezy settings are missing (ApiKey)");
        }

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        _httpClient.DefaultRequestHeaders.Accept.Clear();
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.api+json"));
    }

    private async Task EnsureClientConfiguredAsync()
    {
        var apiBaseUrl = await _serverSettingsService.GetPaymentProcessorApiBaseUrlAsync();

        if (string.IsNullOrWhiteSpace(apiBaseUrl))
        {
            apiBaseUrl = DefaultApiBaseUrl;
        }

        if (_httpClient.BaseAddress == null || !string.Equals(_httpClient.BaseAddress.ToString(), apiBaseUrl, StringComparison.Ordinal))
        {
            _httpClient.BaseAddress = new Uri(apiBaseUrl);
        }
    }

    public async Task<bool> ActiveSubscriptionExists(string email)
    {
        return await GetActiveSubscriptionByEmailAsync(email) != null;
    }

    public async Task<string?> GetActiveCustomerIdByEmailAsync(string email)
    {
        await EnsureClientConfiguredAsync();

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new CustomException("Email is required");
        }

        var response = await GetDataArrayAsync($"customers?filter[email]={Uri.EscapeDataString(email)}&page[size]=100");
        if (response.Count == 0)
        {
            return null;
        }

        var customer = response
            .Where(x => string.Equals(GetOptionalString(GetAttributes(x), "email"), email, StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(x => GetOptionalString(GetAttributes(x), "updated_at") ?? GetOptionalString(GetAttributes(x), "created_at"))
            .FirstOrDefault();

        return customer.ValueKind == JsonValueKind.Undefined ? null : GetRequiredId(customer);
    }

    public async Task<string?> GetActiveCustomerEmailByIdAsync(PaymentProcessorCustomerEmailRequest request)
    {
        await EnsureClientConfiguredAsync();

        if (string.IsNullOrWhiteSpace(request.CustomerId))
        {
            throw new CustomException("CustomerId is required", nameof(request));
        }

        var customer = await GetDataObjectAsync($"customers/{Uri.EscapeDataString(request.CustomerId)}");
        if (customer == null)
        {
            return null;
        }

        return GetOptionalString(GetAttributes(customer.Value), "email");
    }

    public async Task<PaymentProcessorSubscription?> GetActiveSubscriptionByEmailAsync(string email)
    {
        await EnsureClientConfiguredAsync();

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new CustomException("Email is required");
        }

        var subscriptions = await GetDataArrayAsync($"subscriptions?filter[user_email]={Uri.EscapeDataString(email)}&page[size]=100");
        var mapped = new List<PaymentProcessorSubscription>();

        foreach (var item in subscriptions)
        {
            var subscription = await JsonToSubscriptionAsync(item);
            if (IsAccessibleSubscription(subscription.Status, subscription.BillingPeriodEnd))
            {
                mapped.Add(subscription);
            }
        }

        return mapped
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

        var subscriptions = await GetDataArrayAsync(
            $"subscriptions?filter[user_email]={Uri.EscapeDataString(request.Email)}&filter[variant_id]={Uri.EscapeDataString(request.PriceId)}&page[size]=100");

        var mapped = new List<PaymentProcessorSubscription>();

        foreach (var item in subscriptions)
        {
            var subscription = await JsonToSubscriptionAsync(item);
            if (IsAccessibleSubscription(subscription.Status, subscription.BillingPeriodEnd))
            {
                mapped.Add(subscription);
            }
        }

        return mapped
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

        var storeId = await _serverSettingsService.GetPaymentProcessorStoreIdAsync();
        var variantId = request.PriceId.Trim();
        var url = await BuildHostedBuyCheckoutUrlAsync(storeId, variantId, request.Email);

        return new PaymentProcessorCheckoutResponse
        {
            Url = url
        };
    }

    private async Task<string> BuildHostedBuyCheckoutUrlAsync(string storeId, string variantId, string? email)
    {
        if (string.IsNullOrWhiteSpace(storeId))
        {
            throw new CustomException("Lemon Squeezy store ID is missing");
        }

        if (string.IsNullOrWhiteSpace(variantId))
        {
            throw new CustomException("Lemon Squeezy variant ID is missing");
        }

        var storeData = await GetDataObjectAsync($"stores/{Uri.EscapeDataString(storeId)}")
            ?? throw new CustomException("Lemon Squeezy store not found");

        var storeAttributes = GetAttributes(storeData);
        var storeDomain = GetFlexibleString(storeAttributes, "domain");
        var storeUrl = GetFlexibleString(storeAttributes, "url");

        if (string.IsNullOrWhiteSpace(storeDomain) && string.IsNullOrWhiteSpace(storeUrl))
        {
            throw new CustomException("Lemon Squeezy store URL is missing");
        }

        var variantData = await GetDataObjectAsync($"variants/{Uri.EscapeDataString(variantId)}")
            ?? throw new CustomException("Lemon Squeezy variant not found");

        var variantAttributes = GetAttributes(variantData);
        var variantSlug = GetFlexibleString(variantAttributes, "slug");

        if (string.IsNullOrWhiteSpace(variantSlug))
        {
            throw new CustomException("Lemon Squeezy variant slug is missing");
        }

        var checkoutBaseUrl = !string.IsNullOrWhiteSpace(storeDomain)
            ? $"https://{storeDomain.Trim().TrimEnd('/')}"
            : storeUrl!.Trim().TrimEnd('/');

        var checkoutUrl = $"{checkoutBaseUrl}/checkout/buy/{variantSlug}";

        if (!string.IsNullOrWhiteSpace(email))
        {
            checkoutUrl += $"?checkout[email]={Uri.EscapeDataString(email)}";
        }

        return checkoutUrl;
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

        var builder = new UriBuilder(redirectUri);
        var query = HttpUtility.ParseQueryString(builder.Query);

        if (string.IsNullOrWhiteSpace(query["checkout"]))
        {
            query["checkout"] = "success";
        }

        builder.Query = query.ToString() ?? string.Empty;
        return builder.Uri.ToString();
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

        var emailStepNeeded = true;
        if (!string.IsNullOrWhiteSpace(admin.PaymentProcessorSubscriptionId))
        {
            subscription = await GetActiveSubscriptionByIdAsync(admin.PaymentProcessorSubscriptionId);
            if (subscription != null)
            {
                var customerEmail = await GetActiveCustomerEmailByIdAsync(new PaymentProcessorCustomerEmailRequest
                {
                    CustomerId = subscription.CustomerId
                });

                if (string.IsNullOrWhiteSpace(customerEmail) || !customerEmail.Equals(admin.Email, StringComparison.OrdinalIgnoreCase))
                {
                    subscription = null;
                    emailStepNeeded = false;
                }
            }
        }

        if (subscription == null && emailStepNeeded)
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

    public async Task<PortalSessionResponse> CreateCustomerPortalSessionAsync()
    {
        await EnsureClientConfiguredAsync();

        string? subscriptionId = _currentUser.PaymentProcessorSubscriptionId;
        PaymentProcessorSubscription? subscription = null;

        if (!string.IsNullOrWhiteSpace(subscriptionId))
        {
            subscription = await GetActiveSubscriptionByIdAsync(subscriptionId);
        }

        subscription ??= await GetActiveSubscriptionByEmailAsync(_currentUser.Email);

        if (subscription == null)
        {
            throw new CustomException("Lemon Squeezy subscription not found for the current user");
        }

        var subscriptionData = await GetDataObjectAsync($"subscriptions/{Uri.EscapeDataString(subscription.Id)}")
            ?? throw new CustomException("Lemon Squeezy subscription not found");

        var attributes = GetAttributes(subscriptionData);
        if (!attributes.TryGetProperty("urls", out var urlsElement) ||
            !urlsElement.TryGetProperty("customer_portal", out var customerPortalElement))
        {
            throw new CustomException("Lemon Squeezy subscription does not contain urls.customer_portal");
        }

        var url = customerPortalElement.GetString();
        if (string.IsNullOrWhiteSpace(url))
        {
            throw new CustomException("Lemon Squeezy customer portal URL is missing");
        }

        return new PortalSessionResponse
        {
            Url = url
        };
    }

    public async Task<IEnumerable<PaymentProcessorProduct>?> GetActiveProductsAsync()
    {
        await EnsureClientConfiguredAsync();

        var storeId = await _serverSettingsService.GetPaymentProcessorStoreIdAsync();
        var products = await GetDataArrayAsync($"products?filter[store_id]={Uri.EscapeDataString(storeId)}&page[size]=100");
        var variants = await GetDataArrayAsync("variants?filter[status]=published&page[size]=100");

        var paymentProducts = new List<PaymentProcessorProduct>();

        foreach (var productElement in products)
        {
            var productAttributes = GetAttributes(productElement);
            if (!string.Equals(GetOptionalString(productAttributes, "status"), "published", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var productId = GetRequiredId(productElement);
            var prices = new List<PaymentProcessorPrice>();

            foreach (var variantElement in variants)
            {
                var variantAttributes = GetAttributes(variantElement);
                var variantProductId = GetFlexibleString(variantAttributes, "product_id");
                var isSubscription = GetFlexibleBoolean(variantAttributes, "is_subscription");

                if (string.IsNullOrWhiteSpace(variantProductId) ||
                    !string.Equals(variantProductId, productId, StringComparison.Ordinal) ||
                    !isSubscription)
                {
                    continue;
                }

                var priceId = GetRequiredId(variantElement);
                var priceName = await _planRepository.GetPaymentProcessorPriceNameByIdAsync(priceId)
                    ?? GetFlexibleString(variantAttributes, "name")
                    ?? priceId;

                prices.Add(new PaymentProcessorPrice
                {
                    Id = priceId,
                    ProductId = variantProductId,
                    Name = priceName,
                    Description = GetFlexibleString(variantAttributes, "description") ?? string.Empty,
                    Type = isSubscription ? "subscription" : "one_time",
                    BillingCycleInterval = GetFlexibleString(variantAttributes, "interval") ?? "one_time",
                    BillingCycleFrequency = GetFlexibleInt(variantAttributes, "interval_count") ?? 0,
                    UnitPriceAmount = GetFlexibleInt(variantAttributes, "price") ?? 0
                });
            }

            if (prices.Count == 0)
            {
                continue;
            }

            paymentProducts.Add(new PaymentProcessorProduct
            {
                Id = productId,
                Name = GetFlexibleString(productAttributes, "name") ?? productId,
                Description = GetFlexibleString(productAttributes, "description") ?? string.Empty,
                Prices = prices.OrderBy(x => x.UnitPriceAmount).ToList()
            });
        }

        return paymentProducts;
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

    public async Task DowngradePlanPriceAsync(Guid userId, string oldPlanPrice, string newPlanPrice)
    {
        await EnsureClientConfiguredAsync();
        await ChangePlanPriceAsync(userId, oldPlanPrice, newPlanPrice, true);
    }

    public async Task ScheduleDowngradePlanPriceAsync(Guid userId, string oldPlanPrice, string newPlanPrice)
    {
        await DowngradePlanPriceAsync(userId, oldPlanPrice, newPlanPrice);
    }

    public async Task<ScheduledPlanDowngradeInfoDto> GetScheduledPlanDowngradeInfoAsync(Guid userId)
    {
        var subscription = await GetActiveSubscriptionByUserIdAsync(userId, UserRole.Admin, userId);

        return new ScheduledPlanDowngradeInfoDto
        {
            HasScheduledDowngrade = false,
            CurrentBillingPeriodEnd = subscription?.BillingPeriodEnd
        };
    }

    public Task<bool> CancelScheduledPlanDowngradeAsync(Guid userId)
    {
        _ = userId;
        return Task.FromResult(false);
    }

    private async Task ChangePlanPriceAsync(Guid userId, string oldPlanPrice, string newPlanPrice, bool isDowngrade)
    {
        var user = await _usersRepository.GetActiveByIdAsync(userId) ?? throw new CustomException("User not found");
        var products = await GetActiveProductsAsync();
        var prices = products?.SelectMany(p => p.Prices).OrderBy(p => p.UnitPriceAmount).ToList();

        var oldPrice = prices?.FirstOrDefault(p => p.Name.Equals(oldPlanPrice, StringComparison.OrdinalIgnoreCase))
            ?? throw new CustomException($"Old plan price '{oldPlanPrice}' not found");

        var newPrice = prices?.FirstOrDefault(p => p.Name.Equals(newPlanPrice, StringComparison.OrdinalIgnoreCase))
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

        object variantId = TryGetNumericId(newPrice.Id);

        var payload = new
        {
            data = new
            {
                type = "subscriptions",
                id = subscription.Id,
                attributes = new
                {
                    variant_id = variantId,
                    invoice_immediately = !isDowngrade,
                    disable_prorations = false
                }
            }
        };

        using var response = await SendAsync(new HttpMethod("PATCH"), $"subscriptions/{Uri.EscapeDataString(subscription.Id)}", payload);

        if (isDowngrade)
        {
            return;
        }

        var days = (int)await _settingsRepository.GetSettingByKey("user_entities_logging_days");
        DateTime start = DateTime.UtcNow;
        DateTime end = start.AddDays(days);
        await _userSettingsRepository.SetUserEntitiesLogging(userId, start, end);
    }

    private async Task<PaymentProcessorSubscription?> GetActiveSubscriptionByIdAsync(string subscriptionId)
    {
        if (string.IsNullOrWhiteSpace(subscriptionId))
        {
            throw new CustomException("SubscriptionId is required");
        }

        var data = await GetDataObjectAsync($"subscriptions/{Uri.EscapeDataString(subscriptionId)}");
        if (data == null)
        {
            return null;
        }

        var subscription = await JsonToSubscriptionAsync(data.Value);
        return IsAccessibleSubscription(subscription.Status, subscription.BillingPeriodEnd)
            ? subscription
            : null;
    }

    private async Task<PaymentProcessorSubscription> JsonToSubscriptionAsync(JsonElement json)
    {
        var attributes = GetAttributes(json);
        var priceId = GetFlexibleString(attributes, "variant_id")
            ?? throw new CustomException("Lemon Squeezy subscription does not contain variant_id");

        var priceName = await _planRepository.GetPaymentProcessorPriceNameByIdAsync(priceId)
            ?? GetFlexibleString(attributes, "variant_name")
            ?? priceId;

        var createdAt = GetFlexibleString(attributes, "created_at")
            ?? throw new CustomException("Lemon Squeezy subscription does not contain created_at");

        return new PaymentProcessorSubscription
        {
            Id = GetRequiredId(json),
            Status = GetFlexibleString(attributes, "status") ?? throw new CustomException("Lemon Squeezy subscription does not contain status"),
            CustomerId = GetFlexibleString(attributes, "customer_id") ?? throw new CustomException("Lemon Squeezy subscription does not contain customer_id"),
            PriceId = priceId,
            CreatedAt = createdAt,
            PriceName = priceName,
            BillingPeriodStart = GetFlexibleString(attributes, "billing_anchor"),
            BillingPeriodEnd = GetFlexibleString(attributes, "ends_at") ?? GetFlexibleString(attributes, "renews_at"),
            StartedAt = createdAt
        };
    }

    private async Task<List<JsonElement>> GetDataArrayAsync(string path)
    {
        using var response = await SendAsync(HttpMethod.Get, path);
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return new List<JsonElement>();
        }

        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);

        if (!document.RootElement.TryGetProperty("data", out var dataElement) || dataElement.ValueKind != JsonValueKind.Array)
        {
            throw new CustomException("Lemon Squeezy response does not contain a data array");
        }

        return dataElement.EnumerateArray().Select(x => x.Clone()).ToList();
    }

    private async Task<JsonElement?> GetDataObjectAsync(string path)
    {
        using var response = await SendAsync(HttpMethod.Get, path);
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);

        if (!document.RootElement.TryGetProperty("data", out var dataElement) || dataElement.ValueKind != JsonValueKind.Object)
        {
            throw new CustomException("Lemon Squeezy response does not contain a data object");
        }

        return dataElement.Clone();
    }

    private async Task<HttpResponseMessage> SendAsync(HttpMethod method, string path, object? payload = null)
    {
        await EnsureClientConfiguredAsync();

        var request = new HttpRequestMessage(method, path);

        if (payload != null)
        {
            var json = JsonSerializer.Serialize(payload);
            request.Content = new StringContent(json, Encoding.UTF8, "application/vnd.api+json");
        }

        var response = await _httpClient.SendAsync(request);
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return response;
        }

        if (response.IsSuccessStatusCode)
        {
            return response;
        }

        var errorMessage = await GetErrorMessageAsync(response);
        response.Dispose();

        throw new CustomException(errorMessage);
    }

    private static bool IsAccessibleSubscription(string status, string? billingPeriodEnd)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return false;
        }

        if (status.Equals("active", StringComparison.OrdinalIgnoreCase) ||
            status.Equals("on_trial", StringComparison.OrdinalIgnoreCase) ||
            status.Equals("paused", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (!status.Equals("cancelled", StringComparison.OrdinalIgnoreCase))
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

    private static object TryGetNumericId(string value)
    {
        return int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var intId)
            ? intId
            : value;
    }

    private static async Task<string> GetErrorMessageAsync(HttpResponseMessage response)
    {
        var responseText = await response.Content.ReadAsStringAsync();
        var fallbackMessage = $"Lemon Squeezy request failed with status {(int)response.StatusCode} ({response.ReasonPhrase})";

        if (string.IsNullOrWhiteSpace(responseText))
        {
            return fallbackMessage;
        }

        try
        {
            using var document = JsonDocument.Parse(responseText);

            if (document.RootElement.TryGetProperty("errors", out var errorsElement) &&
                errorsElement.ValueKind == JsonValueKind.Array)
            {
                var details = errorsElement
                    .EnumerateArray()
                    .Select(error => GetOptionalString(error, "detail") ?? GetOptionalString(error, "title"))
                    .Where(detail => !string.IsNullOrWhiteSpace(detail))
                    .ToList();

                if (details.Count > 0)
                {
                    return string.Join(" ", details);
                }
            }
        }
        catch (JsonException)
        {
        }

        return responseText;
    }

    private static JsonElement GetAttributes(JsonElement element)
    {
        if (!element.TryGetProperty("attributes", out var attributesElement))
        {
            throw new CustomException("Lemon Squeezy entity does not contain attributes");
        }

        return attributesElement;
    }

    private static string GetRequiredId(JsonElement element)
    {
        if (!element.TryGetProperty("id", out var idElement))
        {
            throw new CustomException("Lemon Squeezy entity does not contain id");
        }

        var id = idElement.GetString();
        if (string.IsNullOrWhiteSpace(id))
        {
            throw new CustomException("Lemon Squeezy entity id is empty");
        }

        return id;
    }

    private static string? GetOptionalString(JsonElement element, string propertyName)
    {
        return element.TryGetProperty(propertyName, out var property)
            ? GetJsonValueAsString(property)
            : null;
    }

    private static string? GetFlexibleString(JsonElement element, string propertyName)
    {
        return GetOptionalString(element, propertyName);
    }

    private static int? GetFlexibleInt(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var property))
        {
            return null;
        }

        return property.ValueKind switch
        {
            JsonValueKind.Number when property.TryGetInt32(out var number) => number,
            JsonValueKind.String when int.TryParse(property.GetString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed) => parsed,
            _ => null
        };
    }

    private static bool GetFlexibleBoolean(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var property))
        {
            return false;
        }

        return property.ValueKind switch
        {
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.String when bool.TryParse(property.GetString(), out var parsed) => parsed,
            _ => false
        };
    }

    private static string? GetJsonValueAsString(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.String => element.GetString(),
            JsonValueKind.Number => element.GetRawText(),
            JsonValueKind.True => bool.TrueString.ToLowerInvariant(),
            JsonValueKind.False => bool.FalseString.ToLowerInvariant(),
            JsonValueKind.Null => null,
            _ => element.GetRawText()
        };
    }
}