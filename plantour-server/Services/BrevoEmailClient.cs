using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using plantour_server.Models;
using plantour_server.Services.Interfaces;
using PlantourApi.Middleware;

namespace plantour_server.Services;

public class BrevoEmailClient : IBrevoEmailClient
{
    private readonly HttpClient _httpClient;
    private readonly BrevoSettings _settings;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web);

    public BrevoEmailClient(HttpClient httpClient, IOptions<BrevoSettings> settings)
    {
        _httpClient = httpClient;
        _settings = settings.Value;

        if (!string.IsNullOrWhiteSpace(_settings.ApiBaseUrl))
        {
            _httpClient.BaseAddress = new Uri(_settings.ApiBaseUrl, UriKind.Absolute);
        }

        if (!_httpClient.DefaultRequestHeaders.Contains("api-key") && !string.IsNullOrWhiteSpace(_settings.ApiKey))
        {
            _httpClient.DefaultRequestHeaders.Add("api-key", _settings.ApiKey);
        }

        if (!_httpClient.DefaultRequestHeaders.Accept.Any())
        {
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }
    }

    public async Task<BrevoSendResult> SendTransactionalEmailAsync(
        string toEmail,
        string? toName,
        string subject,
        string htmlContent,
        string? textContent = null)
    {
        if (string.IsNullOrWhiteSpace(_settings.ApiKey)
            || string.IsNullOrWhiteSpace(_settings.SenderEmail)
            || string.IsNullOrWhiteSpace(_settings.SenderName))
        {
            throw new CustomException("Brevo settings are not configured");
        }

        toName = string.IsNullOrWhiteSpace(toName?.Trim()) ? toEmail : toName.Trim();

        var payload = new
        {
            sender = new { name = _settings.SenderName, email = _settings.SenderEmail },
            to = new[] { new { email = toEmail, name = toName } },
            subject,
            htmlContent,
            textContent = string.IsNullOrWhiteSpace(textContent) ? htmlContent : textContent
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "smtp/email")
        {
            Content = new StringContent(JsonSerializer.Serialize(payload, _jsonOptions), Encoding.UTF8, "application/json")
        };

        using var response = await _httpClient.SendAsync(request);
        var responseContent = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            var message = string.IsNullOrWhiteSpace(responseContent)
                ? "Brevo email request failed"
                : responseContent;
            throw new CustomException(message);
        }

        string? messageId = null;
        if (!string.IsNullOrWhiteSpace(responseContent))
        {
            try
            {
                using var json = JsonDocument.Parse(responseContent);
                if (json.RootElement.TryGetProperty("messageId", out var id))
                {
                    messageId = id.GetString();
                }
            }
            catch
            {
                messageId = null;
            }
        }

        return new BrevoSendResult(messageId);
    }
}
