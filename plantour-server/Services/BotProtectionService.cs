using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using plantour_server.Models;
using plantour_server.Services.Interfaces;
using PlantourApi.Middleware;

namespace plantour_server.Services;

public class BotProtectionService : IBotProtectionService
{
    private const string VerifyEndpoint = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    private readonly HttpClient _httpClient;
    private readonly ILogger<BotProtectionService> _logger;
    private readonly TurnstileSettings _settings;

    public BotProtectionService(
        HttpClient httpClient,
        IOptions<TurnstileSettings> settings,
        ILogger<BotProtectionService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _settings = settings.Value;
    }

    public async Task EnsureHumanVerifiedAsync(string? token, string action, string? remoteIpAddress, CancellationToken cancellationToken = default)
    {
        if (!_settings.Enabled || string.IsNullOrWhiteSpace(_settings.SecretKey))
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(token))
        {
            throw new BaseApiException("Human verification is required.", StatusCodes.Status400BadRequest, "BOT_PROTECTION_REQUIRED");
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, VerifyEndpoint)
        {
            Content = new FormUrlEncodedContent(BuildPayload(token, remoteIpAddress))
        };

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError(
                "Turnstile verification request failed with status code {StatusCode} for action {Action}",
                response.StatusCode,
                action);

            throw new BaseApiException(
                "Human verification is temporarily unavailable. Please try again.",
                StatusCodes.Status503ServiceUnavailable,
                "BOT_PROTECTION_UNAVAILABLE");
        }

        var verificationResult = await response.Content.ReadFromJsonAsync<TurnstileVerifyResponse>(cancellationToken: cancellationToken);
        if (verificationResult?.Success == true)
        {
            return;
        }

        _logger.LogWarning(
            "Turnstile verification failed for action {Action}. Errors: {Errors}",
            action,
            verificationResult?.ErrorCodes is { Length: > 0 }
                ? string.Join(",", verificationResult.ErrorCodes)
                : "unknown");

        throw new BaseApiException("Human verification failed. Please try again.", StatusCodes.Status400BadRequest, "BOT_PROTECTION_FAILED");
    }

    public void EnsureHoneypotIsEmpty(string? value, string fieldName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return;
        }

        _logger.LogWarning("Honeypot field {FieldName} was filled. Request rejected.", fieldName);
        throw new BaseApiException("Request rejected.", StatusCodes.Status400BadRequest, "BOT_PROTECTION_FAILED");
    }

    private Dictionary<string, string> BuildPayload(string token, string? remoteIpAddress)
    {
        var payload = new Dictionary<string, string>
        {
            ["secret"] = _settings.SecretKey,
            ["response"] = token
        };

        if (!string.IsNullOrWhiteSpace(remoteIpAddress))
        {
            payload["remoteip"] = remoteIpAddress;
        }

        return payload;
    }

    private sealed class TurnstileVerifyResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; init; }

        [JsonPropertyName("error-codes")]
        public string[] ErrorCodes { get; init; } = [];
    }
}