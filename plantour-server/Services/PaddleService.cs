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

namespace plantour_server.Services;

public class PaddleService : IPaddleService
{
    private readonly string _baseUrl;
    private readonly string _apiKey;
    private readonly HttpClient _httpclient;
    private readonly CurrentUser _currentUser;

    private readonly UsersRepository _usersRepository;

    public PaddleService(
        HttpClient httpClient,
        HttpCurrentUser httpCurrentUser,
        UsersRepository usersRepository,
        IConfiguration configuration
    )
    {
        _currentUser = httpCurrentUser.CurrentUser;
        _usersRepository = usersRepository;
        _baseUrl = configuration["PaddleSettings:ApiBaseUrl"] ?? throw new CustomException("PaddleSettings:ApiBaseUrl is not configured");
        _apiKey = configuration["PaddleSettings:ApiKey"] ?? throw new CustomException("PaddleSettings:ApiKey is not configured");

        if (string.IsNullOrWhiteSpace(_baseUrl) || string.IsNullOrWhiteSpace(_apiKey))
        {
            throw new CustomException("Paddle settings are missing (ApiBaseUrl or ApiKey)");
        }

        _httpclient = httpClient;
        _httpclient.BaseAddress = new Uri(_baseUrl);
        _httpclient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
    }

    public async Task<string?> GetCustomerIdByEnmailAsync(string email)
    {
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
        return customerId;
    }

    public async Task<string?> GetCustomerEmailByIdAsync(PaddleCustomerEmailRequest request)
    {
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

        return email;
    }


    public async Task<bool> ActiveSubscriptionExists(string email)
    {
        string? customerId = await GetCustomerIdByEnmailAsync(email);
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

    public async Task<PaddleSubscription?> GetActiveSubscriptionByEmailAsync(string email)
    {
        string? customerId = await GetCustomerIdByEnmailAsync(email);
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


        PaddleSubscription result = Json2Subscription(list.First());

        return result;
    }

    private PaddleSubscription Json2Subscription(JsonElement json)
    {
        if (!json.TryGetProperty("id", out var idElement) ||
            !json.TryGetProperty("status", out var statusElement) ||
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

        var firstItem = itemsElement[0];
        if (!firstItem.TryGetProperty("price", out var priceElement) ||
            !priceElement.TryGetProperty("id", out var priceIdElement))
        {

            throw new CustomException("Paddle response does not contain items[0].price.id");
        }
        string? priceId = priceIdElement.GetString();


        if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(status) || string.IsNullOrWhiteSpace(customerId) || string.IsNullOrWhiteSpace(createdAt) || string.IsNullOrWhiteSpace(priceId))
        {
            throw new CustomException("Paddle subscription properties cannot be empty");
        }

        return new PaddleSubscription
        {
            Id = id,
            Status = status,
            CustomerId = customerId,
            PriceId = priceId,
            CreatedAt = createdAt
        };
    }

    public async Task<string?> GetSubscriptionIdAsync(PaddleSubscriptionIdRequest request)
    {
        string? customerId = await GetCustomerIdByEnmailAsync(request.Email);
        if (String.IsNullOrWhiteSpace(customerId))
        {
            return null;
        }

        var response = await _httpclient.GetAsync($"subscriptions?customer_id={Uri.EscapeDataString(customerId)}&price_id={Uri.EscapeDataString(request.PriceId)}");

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

        List<PaddleSubscription> subscriptions = new List<PaddleSubscription>();

        foreach (var item in list)
        {
            if (!item.TryGetProperty("id", out var idElement) ||
                !item.TryGetProperty("status", out var statusElement) ||
                !item.TryGetProperty("created_at", out var createdAtElement))
            {
                throw new CustomException("Paddle response does not contain required subscription properties");
            }
            string? id = idElement.GetString();
            string? status = statusElement.GetString();
            string? createdAt = createdAtElement.GetString();

            if (!item.TryGetProperty("items", out var itemsElement) ||
                itemsElement.ValueKind != JsonValueKind.Array ||
                itemsElement.GetArrayLength() == 0)
            {
                throw new CustomException("Paddle response does not contain subscription items");
            }

            var firstItem = itemsElement[0];
            if (!firstItem.TryGetProperty("price", out var priceElement) ||
                !priceElement.TryGetProperty("id", out var priceIdElement))
            {
                throw new CustomException("Paddle response does not contain items[0].price.id");
            }

            string? priceId = priceIdElement.GetString();
            if (!string.Equals(priceId, request.PriceId, StringComparison.Ordinal))
            {
                continue;
            }

            if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(status) || string.IsNullOrWhiteSpace(customerId) || string.IsNullOrWhiteSpace(priceId) || string.IsNullOrWhiteSpace(createdAt))
            {
                throw new CustomException("Paddle subscription properties cannot be empty");
            }

            subscriptions.Add(new PaddleSubscription
            {
                Id = id,
                Status = status,
                CustomerId = customerId,
                PriceId = priceId,
                CreatedAt = createdAt
            });
        }

        if (subscriptions.Count == 0)
        {
            return null; // Subscription not found with the specified price ID
        }

        var activeSubscriptions = subscriptions.Where(s => string.Equals(s.Status, "active", StringComparison.OrdinalIgnoreCase)).OrderByDescending(s => s.CreatedAt).ToList();

        if (activeSubscriptions.Count > 0)
        {
            return activeSubscriptions.First().Id; // Return the most recently created active subscription
        }

        var notActiveSubscriptions = subscriptions.Where(s => !string.Equals(s.Status, "active", StringComparison.OrdinalIgnoreCase)).OrderByDescending(s => s.CreatedAt).ToList();
        return notActiveSubscriptions.First().Id; // Return the most recently created not active subscription
    }

    public async Task<PaddleSubscription?> GetActiveSubscriptionByIdAsync(string subscriptionId)
    {
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

        var subscription = Json2Subscription(json.RootElement.GetProperty("data"));
        if (!string.Equals(subscription.Status, "active", StringComparison.OrdinalIgnoreCase))
        {
            return null; // Subscription is not active
        }

        return subscription;
    }

    public async Task<PaddleSubscription?> GetActiveSubscriptionByUserAsync(User user, UserRole role, Guid adminId)
    {
        if (user == null)
        {
            throw new CustomException("User is required");
        }

        PaddleSubscription? subscription = null;

        var admin = user;

        if (role == UserRole.Participant)
        {
            admin = await _usersRepository.GetActiveByIdAsync(adminId);
            if (admin == null)
            {
                throw new CustomException("Admin user not found");
            }
        }

        if (!string.IsNullOrWhiteSpace(admin.PaddleSubscriptionId))
        {
            subscription = await GetActiveSubscriptionByIdAsync(admin.PaddleSubscriptionId);
        }

        if (subscription == null)
        {
            subscription = await GetActiveSubscriptionByEmailAsync(admin.Email);
        }

        if (subscription == null)
        {
            if (!string.IsNullOrWhiteSpace(admin.PaddleCustomerId))
            {
                admin.PaddleSubscriptionId = null;
                await _usersRepository.UpdateAsync(admin);
            }
            return null;
        }

        if (admin.PaddleSubscriptionId != subscription!.Id)
        {
            admin.PaddleSubscriptionId = subscription!.Id;
            await _usersRepository.UpdateAsync(admin);
        }

        return subscription;
    }

    public async Task<PortalSessionResponse> CreateCustomerPortalSessionAsync()
    {
        _currentUser.RaiseIfNotAdmin();

        var customerId = _currentUser.PaddleCustomerId;
        if (string.IsNullOrWhiteSpace(customerId))
        {
            customerId = await GetCustomerIdByEnmailAsync(_currentUser.Email);
        }

        if (string.IsNullOrWhiteSpace(customerId))
        {
            throw new CustomException("Paddle customer not found for the current user");
        }

        HttpContent? content = null;

        if (!string.IsNullOrWhiteSpace(_currentUser.PaddleSubscriptionId))
        {
            var requestBody = JsonSerializer.Serialize(new
            {
                subscription_ids = new[] { _currentUser.PaddleSubscriptionId }
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


}
