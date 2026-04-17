using plantour_maintenance_server.DTOs;

namespace plantour_maintenance_server.Services.Interfaces;

public interface IIpGeolocationService
{
    Task<IReadOnlyDictionary<string, IpGeolocationResult>> GetByIpAddressesAsync(
        IReadOnlyCollection<string> ipAddresses,
        CancellationToken cancellationToken = default);
}