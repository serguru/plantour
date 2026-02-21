using AutoMapper;
using System.Net.Http.Headers;
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

    public PaddleService(
        HttpClient httpClient,
        IConfiguration configuration
    )
    {
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

//        GET https://api.paddle.com/subscriptions?customer_id=ctm_123&price_id=pri_456


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

            if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(status) || string.IsNullOrWhiteSpace(customerId) || string.IsNullOrWhiteSpace(priceId))
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

}
