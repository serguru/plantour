using System.Text.Json;

namespace plantour_server.Services;

public class ExpenseCurrencyRateService(HttpClient httpClient, ILogger<ExpenseCurrencyRateService> logger) : IExpenseCurrencyRateService
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly ILogger<ExpenseCurrencyRateService> _logger = logger;

    public async Task<decimal?> TryGetRateAsync(string fromCurrencyCode, string toCurrencyCode, CancellationToken cancellationToken = default)
    {
        if (string.Equals(fromCurrencyCode, toCurrencyCode, StringComparison.OrdinalIgnoreCase))
        {
            return 1m;
        }

        var from = fromCurrencyCode.Trim().ToUpperInvariant();
        var to = toCurrencyCode.Trim().ToUpperInvariant();
        var url = $"https://api.frankfurter.app/latest?from={Uri.EscapeDataString(from)}&to={Uri.EscapeDataString(to)}";

        try
        {
            using var response = await _httpClient.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                // TODO LOG
                // _logger.LogWarning("Failed to resolve exchange rate from {FromCurrency} to {ToCurrency}. Status code: {StatusCode}", from, to, response.StatusCode);
                return null;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

            if (!document.RootElement.TryGetProperty("rates", out var ratesElement) ||
                !ratesElement.TryGetProperty(to, out var rateElement) ||
                !rateElement.TryGetDecimal(out var rate))
            {
                // TODO LOG
                // _logger.LogWarning("Exchange rate response did not contain a valid rate from {FromCurrency} to {ToCurrency}", from, to);
                return null;
            }

            return rate;
        }
        catch (Exception)
        {
            // TODO LOG
            // _logger.LogWarning(ex, "Failed to resolve exchange rate from {FromCurrency} to {ToCurrency}", from, to);
            return null;
        }
    }
}