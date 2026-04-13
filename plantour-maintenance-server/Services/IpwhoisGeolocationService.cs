using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.Caching.Memory;
using plantour_maintenance_server.DTOs;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Services;

public sealed class IpwhoisGeolocationService(
    HttpClient httpClient,
    IMemoryCache memoryCache) : IIpGeolocationService
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(12);

    private readonly HttpClient _httpClient = httpClient;
    private readonly IMemoryCache _memoryCache = memoryCache;

    public async Task<IReadOnlyDictionary<string, IpGeolocationResult>> GetByIpAddressesAsync(
        IReadOnlyCollection<string> ipAddresses,
        CancellationToken cancellationToken = default)
    {
        var result = new Dictionary<string, IpGeolocationResult>(StringComparer.Ordinal);

        foreach (var ipAddress in ipAddresses.Distinct(StringComparer.Ordinal))
        {
            result[ipAddress] = await GetByIpAddressAsync(ipAddress, cancellationToken);
        }

        return result;
    }

    private async Task<IpGeolocationResult> GetByIpAddressAsync(string ipAddress, CancellationToken cancellationToken)
    {
        if (!IPAddress.TryParse(ipAddress, out var parsedIpAddress) || IsPrivateOrLocalIpAddress(parsedIpAddress))
        {
            return new IpGeolocationResult();
        }

        var cacheKey = $"ip-geolocation:{ipAddress}";
        if (_memoryCache.TryGetValue(cacheKey, out IpGeolocationResult? cachedResult) && cachedResult != null)
        {
            return cachedResult;
        }

        try
        {
            using var response = await _httpClient.GetAsync(ipAddress, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                // TODO LOG
                // _logger.LogWarning("ipwho.is lookup failed for {IpAddress} with status {StatusCode}", ipAddress, response.StatusCode);
                return Cache(cacheKey, new IpGeolocationResult());
            }

            var payload = await response.Content.ReadFromJsonAsync<IpwhoisResponse>(cancellationToken: cancellationToken);
            if (payload?.Success != true)
            {
                return Cache(cacheKey, new IpGeolocationResult());
            }

            return Cache(cacheKey, new IpGeolocationResult
            {
                Country = payload.Country,
                City = payload.City
            });
        }
        catch (Exception)
        {
            // TODO LOG
            // _logger.LogWarning(exception, "ipwho.is lookup threw for {IpAddress}", ipAddress);
            return Cache(cacheKey, new IpGeolocationResult());
        }
    }

    private IpGeolocationResult Cache(string cacheKey, IpGeolocationResult result)
    {
        _memoryCache.Set(cacheKey, result, CacheDuration);
        return result;
    }

    private static bool IsPrivateOrLocalIpAddress(IPAddress ipAddress)
    {
        if (IPAddress.IsLoopback(ipAddress))
        {
            return true;
        }

        if (ipAddress.IsIPv4MappedToIPv6)
        {
            ipAddress = ipAddress.MapToIPv4();
        }

        if (ipAddress.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
        {
            var bytes = ipAddress.GetAddressBytes();

            return bytes[0] == 10
                || (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31)
                || (bytes[0] == 192 && bytes[1] == 168)
                || (bytes[0] == 169 && bytes[1] == 254)
                || bytes[0] == 127;
        }

        return ipAddress.IsIPv6LinkLocal
            || ipAddress.IsIPv6Multicast
            || ipAddress.IsIPv6SiteLocal
            || ipAddress.Equals(IPAddress.IPv6Loopback);
    }

    private sealed class IpwhoisResponse
    {
        public bool Success { get; init; }
        public string? Country { get; init; }
        public string? City { get; init; }
    }
}