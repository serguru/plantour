namespace plantour_server.Services;

public interface IExpenseCurrencyRateService
{
    Task<decimal?> TryGetRateAsync(string fromCurrencyCode, string toCurrencyCode, CancellationToken cancellationToken = default);
}