using AutoMapper;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Repositories;
using plantour_server.Utils;
using PlantourApi.Middleware;
using PlantourApi.Models;
using plantour_server.Services.TickerQ;
using System.Globalization;

namespace plantour_server.Services;

public class PaddleService : IPaymentProcessorService
{
    private readonly string _apiKey;
    private readonly HttpClient _httpclient;
    private readonly CurrentUser _currentUser;
    private readonly ServerSettingsService _serverSettingsService;

    private readonly UsersRepository _usersRepository;
    private readonly PlanRepository _planRepository;
    private readonly TimeTickerRepository _timeTickerRepository;

    UserSettingsRepository _userSettingsRepository;
    SettingsRepository _settingsRepository;

    public PaddleService(
        HttpClient httpClient,
        HttpCurrentUser httpCurrentUser,
        UsersRepository usersRepository,
        PlanRepository planRepository,
        TimeTickerRepository timeTickerRepository,
        UserSettingsRepository userSettingsRepository,
        SettingsRepository settingsRepository,
        ServerSettingsService serverSettingsService,
        IConfiguration configuration
    )
    {
        _currentUser = httpCurrentUser.CurrentUser;
        _usersRepository = usersRepository;
        _timeTickerRepository = timeTickerRepository;
        _planRepository = planRepository;
        _userSettingsRepository = userSettingsRepository;
        _settingsRepository = settingsRepository;
        _serverSettingsService = serverSettingsService;

        _apiKey = configuration["PaddleSettings:ApiKey"] ?? throw new CustomException("PaddleSettings:ApiKey is not configured");

        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            throw new CustomException("Paddle settings are missing (ApiKey)");
        }

        _httpclient = httpClient;
        _httpclient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
    }

    private async Task EnsureClientConfiguredAsync()
    {
        var baseUrl = await _serverSettingsService.GetPaymentProcessorApiBaseUrlAsync();
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            throw new CustomException("payment processor api base URL is not configured");
        }

        if (_httpclient.BaseAddress == null || !string.Equals(_httpclient.BaseAddress.ToString(), baseUrl, StringComparison.Ordinal))
        {
            _httpclient.BaseAddress = new Uri(baseUrl);
        }
    }

    public async Task<string?> GetActiveCustomerIdByEmailAsync(string email)
    {
        await EnsureClientConfiguredAsync();

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new CustomException("Email is required");
        }

        var encodedEmail = Uri.EscapeDataString(email);

        var response = await _httpclient.GetAsync($"customers?email={encodedEmail}");
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null; // No customer found with this email
        }
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(content);

        if (!json.RootElement.TryGetProperty("data", out var dataElement))
        {
            throw new CustomException("Paddle response does not contain data field");
        }

        var list = dataElement.EnumerateArray();

        if (!list.Any())
        {
            return null; // No customer found with this email
        }

        if (list.Count() > 1)
        {
            throw new CustomException("Multiple customers found with the same email, cannot determine subscription ID");
        }

        var customer = list.First();
        if (!customer.TryGetProperty("id", out var idElement))
        {
            throw new CustomException("Paddle response does not contain customer id property");
        }

        string? customerId = idElement.GetString();
        if (string.IsNullOrWhiteSpace(customerId))
        {
            throw new CustomException("Paddle response does not contain customer id");
        }

        if (!customer.TryGetProperty("status", out var statusElement))
        {
            throw new CustomException("Paddle response does not contain customer status property");
        }

        string? status = statusElement.GetString();
        if (string.IsNullOrWhiteSpace(status) || !string.Equals(status, "active", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        return customerId;
    }

    public async Task<string?> GetActiveCustomerEmailByIdAsync(PaymentProcessorCustomerEmailRequest request)
    {
        await EnsureClientConfiguredAsync();

        if (string.IsNullOrWhiteSpace(request.CustomerId))
        {
            throw new CustomException("CustomerId is required", nameof(request));
        }

        var response = await _httpclient.GetAsync($"customers/{Uri.EscapeDataString(request.CustomerId)}");

        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null; // Customer not found
        }

        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(content);

        if (!json.RootElement.TryGetProperty("data", out var dataElement) ||
          !dataElement.TryGetProperty("email", out var emailElement))
        {
            throw new CustomException("Paddle response does not contain data.email");
        }

        var email = emailElement.GetString();

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new CustomException("Customer email is empty in Paddle response");
        }

        if (!dataElement.TryGetProperty("status", out var statusElement))
        {
            throw new CustomException("Paddle response does not contain customer status property");
        }

        string? status = statusElement.GetString();
        if (string.IsNullOrWhiteSpace(status) || !string.Equals(status, "active", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }
        return email;
    }

    public async Task<bool> ActiveSubscriptionExists(string email)
    {
        await EnsureClientConfiguredAsync();

        string? customerId = await GetActiveCustomerIdByEmailAsync(email);
        if (String.IsNullOrWhiteSpace(customerId))
        {
            return false;
        }

        var response = await _httpclient.GetAsync($"subscriptions?customer_id={Uri.EscapeDataString(customerId)}&status=active");
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }

        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(content);

        if (!json.RootElement.TryGetProperty("data", out var dataElement))
        {
            throw new CustomException("Paddle response does not contain data field");
        }

        var list = dataElement.EnumerateArray();

        return list.Any();
    }

    public async Task<PaymentProcessorSubscription?> GetActiveSubscriptionByEmailAsync(string email)
    {
        await EnsureClientConfiguredAsync();

        string? customerId = await GetActiveCustomerIdByEmailAsync(email);
        if (String.IsNullOrWhiteSpace(customerId))
        {
            return null;
        }

        if (String.IsNullOrWhiteSpace(customerId))
        {
            throw new CustomException("Customer Id is required");
        }
        var response = await _httpclient.GetAsync($"subscriptions?customer_id={Uri.EscapeDataString(customerId)}&status=active");
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(content);

        if (!json.RootElement.TryGetProperty("data", out var dataElement))
        {
            throw new CustomException("Paddle response does not contain data field");
        }

        var list = dataElement.EnumerateArray().OrderByDescending(s => s.GetProperty("created_at").GetString()).ToList();

        if (!list.Any())
        {
            return null;
        }

        if (list.Count() > 1)
        {
            throw new CustomException($"Multiple active subscriptions found for the same customer with email {email}, cannot determine which one is correct");
        }

        var result = await Json2Subscription(list.First());

        return result;
    }

    private async Task<PaymentProcessorSubscription> Json2Subscription(JsonElement json)
    {
        if (!json.TryGetProperty("id", out var idElement) ||
            !json.TryGetProperty("status", out var statusElement) ||
            !json.TryGetProperty("started_at", out var startedAtElement) ||
            !json.TryGetProperty("customer_id", out var customerIdElement) ||
            !json.TryGetProperty("created_at", out var createdAtElement) ||
            !json.TryGetProperty("items", out var itemsElement) ||
            itemsElement.ValueKind != JsonValueKind.Array ||
            itemsElement.GetArrayLength() == 0)
        {
            throw new CustomException("Paddle response does not contain required subscription properties");
        }

        string? id = idElement.GetString();
        string? status = statusElement.GetString();
        string? customerId = customerIdElement.GetString();
        string? createdAt = createdAtElement.GetString();
        string? startedAt = startedAtElement.GetString();

        var firstItem = itemsElement[0];
        if (!firstItem.TryGetProperty("price", out var priceElement) ||
            !priceElement.TryGetProperty("id", out var priceIdElement))
        {

            throw new CustomException("Paddle response does not contain items[0].price.id or items[0].price.name");
        }
        string? priceId = priceIdElement.GetString();

        if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(status) || string.IsNullOrWhiteSpace(customerId) || string.IsNullOrWhiteSpace(createdAt) || string.IsNullOrWhiteSpace(startedAt) || string.IsNullOrWhiteSpace(priceId))
        {
            throw new CustomException("Paddle subscription properties cannot be empty");
        }

        string? priceName = await _planRepository.GetPriceNameByPriceIdAsync(priceId);

        if (string.IsNullOrWhiteSpace(priceName))
        {
            throw new CustomException($"No price name found for PriceId: {priceId}");
        }

        string? billingPeriodStart = null;
        string? billingPeriodEnd = null;
        if (json.TryGetProperty("current_billing_period", out var billingPeriodElement) &&
            billingPeriodElement.TryGetProperty("starts_at", out var billingPeriodStartElement) &&
            billingPeriodElement.TryGetProperty("ends_at", out var billingPeriodEndElement))
        {
            billingPeriodStart = billingPeriodStartElement.GetString();
            billingPeriodEnd = billingPeriodEndElement.GetString();
        }

        return new PaymentProcessorSubscription
        {
            Id = id,
            Status = status,
            CustomerId = customerId,
            PriceId = priceId,
            CreatedAt = createdAt,
            PriceName = priceName,
            BillingPeriodStart = billingPeriodStart,
            BillingPeriodEnd = billingPeriodEnd,
            StartedAt = startedAt
        };
    }

    public async Task<string?> GetActiveSubscriptionIdAsync(PaymentProcessorSubscriptionIdRequest request)
    {
        await EnsureClientConfiguredAsync();

        string? customerId = await GetActiveCustomerIdByEmailAsync(request.Email);
        if (String.IsNullOrWhiteSpace(customerId))
        {
            return null;
        }

        var response = await _httpclient.GetAsync($"subscriptions?customer_id={Uri.EscapeDataString(customerId)}&price_id={Uri.EscapeDataString(request.PriceId)}&status=active");

        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null; // Subscription not found
        }

        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(content);

        if (!json.RootElement.TryGetProperty("data", out var dataElement))
        {
            throw new CustomException("Paddle response does not contain data field");
        }

        var list = dataElement.EnumerateArray();

        if (!list.Any())
        {
            return null; // Subscription not found
        }

        List<PaymentProcessorSubscription> subscriptions = new List<PaymentProcessorSubscription>();

        foreach (var item in list)
        {
            subscriptions.Add(await Json2Subscription(item));
        }

        if (subscriptions.Count == 0)
        {
            return null; // Subscription not found with the specified price ID
        }

        subscriptions = subscriptions.OrderByDescending(s => s.CreatedAt).ToList();

        if (subscriptions.Count > 0)
        {
            return subscriptions.First().Id; // Return the most recently created active subscription
        }

        var notActiveSubscriptions = subscriptions.Where(s => !string.Equals(s.Status, "active", StringComparison.OrdinalIgnoreCase)).OrderByDescending(s => s.CreatedAt).ToList();
        return notActiveSubscriptions.First().Id; // Return the most recently created not active subscription
    }

    public Task<PaymentProcessorCheckoutResponse> CreateCheckoutSessionAsync(PaymentProcessorCheckoutRequest request)
    {
        throw new CustomException("Server-generated checkout sessions are not supported by the Paddle integration.");
    }

    public async Task<PaymentProcessorSubscription?> GetActiveSubscriptionByIdAsync(string subscriptionId)
    {
        await EnsureClientConfiguredAsync();

        if (string.IsNullOrWhiteSpace(subscriptionId))
        {
            throw new CustomException("SubscriptionId is required");
        }

        var response = await _httpclient.GetAsync($"subscriptions/{Uri.EscapeDataString(subscriptionId)}");

        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null; // Subscription not found
        }

        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(content);

        var subscription = await Json2Subscription(json.RootElement.GetProperty("data"));
        if (!string.Equals(subscription.Status, "active", StringComparison.OrdinalIgnoreCase))
        {
            return null; // Subscription is not active
        }

        return subscription;
    }

    // userId can be participant or admin
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
            admin = await _usersRepository.GetActiveByIdAsync(adminId);
            if (admin == null)
            {
                throw new CustomException("Admin user not found");
            }
        }

        bool emailStepNeeded = true;
        if (!string.IsNullOrWhiteSpace(admin.PaymentProcessorSubscriptionId))
        {
            subscription = await GetActiveSubscriptionByIdAsync(admin.PaymentProcessorSubscriptionId);
            if (subscription != null)
            {
                var r = new PaymentProcessorCustomerEmailRequest()
                {
                    CustomerId = subscription.CustomerId
                };

                var email = await GetActiveCustomerEmailByIdAsync(r);
                if (String.IsNullOrWhiteSpace(email) || !email.Equals(admin.Email, StringComparison.OrdinalIgnoreCase))
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
                //admin.PriceEnumId = (int)PlanPrice.Starter;
                await _usersRepository.UpdateAsync(admin);
            }
            return null;
        }

        if (admin.PaymentProcessorSubscriptionId != subscription!.Id)
        {
            admin.PaymentProcessorSubscriptionId = subscription!.Id;
            //admin.PriceEnumId = null;
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

    // Called by admins only
    public async Task<PortalSessionResponse> CreateCustomerPortalSessionAsync()
    {
        await EnsureClientConfiguredAsync();

        string? customerId = await GetActiveCustomerIdByEmailAsync(_currentUser.Email);

        if (string.IsNullOrWhiteSpace(customerId))
        {
            throw new CustomException("Paddle customer not found for the current user");
        }

        string? subscriptionId = _currentUser.PaymentProcessorSubscriptionId;

        if (string.IsNullOrWhiteSpace(subscriptionId))
        {
            var activeSubscription = await GetActiveSubscriptionByEmailAsync(_currentUser.Email);
            subscriptionId = activeSubscription?.Id;
        }

        HttpContent? content = null;

        if (!string.IsNullOrWhiteSpace(subscriptionId))
        {
            var requestBody = JsonSerializer.Serialize(new
            {
                subscription_ids = new[] { subscriptionId }
            });
            content = new StringContent(requestBody, Encoding.UTF8, "application/json");
        }

        var response = await _httpclient.PostAsync($"customers/{Uri.EscapeDataString(customerId)}/portal-sessions", content);
        response.EnsureSuccessStatusCode();

        var responseContent = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(responseContent);

        if (!json.RootElement.TryGetProperty("data", out var dataElement) ||
            !dataElement.TryGetProperty("urls", out var urlsElement) ||
            !urlsElement.TryGetProperty("general", out var generalElement) ||
            !generalElement.TryGetProperty("overview", out var overviewElement))
        {
            throw new CustomException("Paddle portal session response does not contain data.urls.general.overview");
        }

        var url = overviewElement.GetString();
        if (string.IsNullOrWhiteSpace(url))
        {
            throw new CustomException("Paddle portal URL is missing in response");
        }

        return new PortalSessionResponse
        {
            Url = url
        };
    }

    public async Task<IEnumerable<PaymentProcessorProduct>?> GetActiveProductsAsync()
    {
        await EnsureClientConfiguredAsync();

        var response = await _httpclient.GetAsync("products?include=prices&status=active");
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(content);

        if (!json.RootElement.TryGetProperty("data", out var dataElement))
        {
            throw new CustomException("Paddle response does not contain data field");
        }

        if (dataElement.ValueKind != JsonValueKind.Array)
        {
            throw new CustomException("Paddle response data field must be an array");
        }

        var list = dataElement.EnumerateArray().ToList();

        if (!list.Any())
        {
            return null;
        }

        var products = new List<PaymentProcessorProduct>();

        foreach (var productElement in list)
        {
            if (!productElement.TryGetProperty("id", out var productIdElement) ||
                !productElement.TryGetProperty("name", out var productNameElement) ||
                !productElement.TryGetProperty("description", out var productDescriptionElement) ||
                !productElement.TryGetProperty("prices", out var pricesElement))
            {
                throw new CustomException("Paddle product does not contain required properties (id, name, description, prices)");
            }

            if (pricesElement.ValueKind != JsonValueKind.Array)
            {
                throw new CustomException("Paddle product prices field must be an array");
            }

            var productId = productIdElement.GetString();
            var productName = productNameElement.GetString();
            var productDescription = productDescriptionElement.GetString();

            if (string.IsNullOrWhiteSpace(productId) ||
                string.IsNullOrWhiteSpace(productName) ||
                string.IsNullOrWhiteSpace(productDescription))
            {
                throw new CustomException("Paddle product properties cannot be empty");
            }

            var prices = new List<PaymentProcessorPrice>();

            foreach (var priceElement in pricesElement.EnumerateArray())
            {
                if (!priceElement.TryGetProperty("id", out var priceIdElement) ||
                    !priceElement.TryGetProperty("product_id", out var priceProductIdElement) ||
                    !priceElement.TryGetProperty("name", out var priceNameElement) ||
                    !priceElement.TryGetProperty("description", out var priceDescriptionElement) ||
                    !priceElement.TryGetProperty("type", out var priceTypeElement) ||
                    !priceElement.TryGetProperty("billing_cycle", out var billingCycleElement) ||
                    !priceElement.TryGetProperty("unit_price", out var unitPriceElement))
                {
                    throw new CustomException("Paddle price does not contain required properties");
                }

                if (billingCycleElement.ValueKind != JsonValueKind.Object ||
                    !billingCycleElement.TryGetProperty("interval", out var billingIntervalElement) ||
                    !billingCycleElement.TryGetProperty("frequency", out var billingFrequencyElement))
                {
                    throw new CustomException("Paddle price billing_cycle does not contain required properties (interval, frequency)");
                }

                if (unitPriceElement.ValueKind != JsonValueKind.Object ||
                    !unitPriceElement.TryGetProperty("amount", out var unitPriceAmountElement))
                {
                    throw new CustomException("Paddle price unit_price does not contain required property amount");
                }

                var priceId = priceIdElement.GetString();
                var priceProductId = priceProductIdElement.GetString();
                var priceName = priceNameElement.GetString();
                var priceDescription = priceDescriptionElement.GetString();
                var priceType = priceTypeElement.GetString();
                var billingInterval = billingIntervalElement.GetString();

                if (!billingFrequencyElement.TryGetInt32(out var billingFrequency))
                {
                    throw new CustomException("Paddle price billing_cycle.frequency must be an integer");
                }

                var amountText = unitPriceAmountElement.ValueKind switch
                {
                    JsonValueKind.String => unitPriceAmountElement.GetString(),
                    JsonValueKind.Number => unitPriceAmountElement.GetRawText(),
                    _ => null
                };

                if (string.IsNullOrWhiteSpace(amountText) || !int.TryParse(amountText, out var unitPriceAmount))
                {
                    throw new CustomException("Paddle price unit_price.amount must be a valid integer");
                }

                if (string.IsNullOrWhiteSpace(priceId) ||
                    string.IsNullOrWhiteSpace(priceProductId) ||
                    string.IsNullOrWhiteSpace(priceName) ||
                    string.IsNullOrWhiteSpace(priceDescription) ||
                    string.IsNullOrWhiteSpace(priceType) ||
                    string.IsNullOrWhiteSpace(billingInterval))
                {
                    throw new CustomException("Paddle price properties cannot be empty");
                }

                prices.Add(new PaymentProcessorPrice
                {
                    Id = priceId,
                    ProductId = priceProductId,
                    Name = priceName,
                    Description = priceDescription,
                    Type = priceType,
                    BillingCycleInterval = billingInterval,
                    BillingCycleFrequency = billingFrequency,
                    UnitPriceAmount = unitPriceAmount
                });
            }

            products.Add(new PaymentProcessorProduct
            {
                Id = productId,
                Name = productName,
                Description = productDescription,
                Prices = prices
            });
        }
        return products;
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
        await DowngradePlanPriceAsync(userId, oldPlanPrice, newPlanPrice);
    }

    private async Task ChangePlanPriceAsync(Guid userId, string oldPlanPrice, string newPlanPrice, bool isDowngrade)
    {
        var user = await _usersRepository.GetActiveByIdAsync(userId) ?? throw new CustomException("User not found");
        var products = await GetActiveProductsAsync();
        var prices = products?.SelectMany(p => p.Prices).OrderBy(p => p.UnitPriceAmount).ToList();

        var oldPrice = (prices?.FirstOrDefault(p => p.Name.Equals(oldPlanPrice, StringComparison.OrdinalIgnoreCase))) ?? throw new CustomException($"Old plan price '{oldPlanPrice}' not found");

        var newPrice = (prices?.FirstOrDefault(p => p.Name.Equals(newPlanPrice, StringComparison.OrdinalIgnoreCase))) ?? throw new CustomException($"New plan price '{newPlanPrice}' not found");

        if (isDowngrade)
        {
            if (oldPrice.UnitPriceAmount < newPrice.UnitPriceAmount)
            {
                throw new CustomException($"Old plan price '{oldPlanPrice}' is cheaper than new plan price '{newPlanPrice}', cannot downgrade");
            }
        }
        else
        {
            if (oldPrice.UnitPriceAmount > newPrice.UnitPriceAmount)
            {
                throw new CustomException($"Old plan price '{oldPlanPrice}' is more expensive than new plan price '{newPlanPrice}', cannot upgrade");
            }
        }

        PaymentProcessorSubscription? subscription = await GetActiveSubscriptionByEmailAsync(user.Email);

        if (subscription == null)
        {
            throw new CustomException("No active subscription found for the user with email " + user.Email);
        }

        if (subscription.PriceId != oldPrice.Id)
        {
            throw new CustomException($"Current subscription price ID '{subscription.PriceId}' does not match the expected old price ID '{oldPrice.Id}' for the user with email " + user.Email + ")");
        }
        var payload = new
        {
            items = new[]
                    {
                new {
                    price_id = newPrice.Id,
                    quantity = 1
                }
            },
            proration_billing_mode = isDowngrade ? "do_not_bill" : "prorated_immediately"
        };

        var url = $"subscriptions/{subscription.Id}";
        var response = await _httpclient.PatchAsJsonAsync(url, payload);
        string errorJson = await response.Content.ReadAsStringAsync();
        response.EnsureSuccessStatusCode();
        if (isDowngrade)
        {
            return;
        }
        var days = (int)await _settingsRepository.GetSettingByKey("user_entities_logging_days");
        DateTime start = DateTime.UtcNow;
        DateTime end = start.AddDays(days);
        await _userSettingsRepository.SetUserEntitiesLogging(userId, start, end);

    }

    public async Task DowngradePlanPriceAsync(Guid userId, string oldPlanPrice, string newPlanPrice)
    {
        await EnsureClientConfiguredAsync();

        await ChangePlanPriceAsync(userId, oldPlanPrice, newPlanPrice, true);
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

}
