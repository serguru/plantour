using plantour_maintenance_server.DTOs;
using plantour_maintenance_server.Middleware;
using plantour_maintenance_server.Repositories;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Services;

public sealed class VisitorActivityService(
    ApiVisitRepository apiVisitRepository,
    IIpGeolocationService ipGeolocationService) : IVisitorActivityService
{
    private readonly ApiVisitRepository _apiVisitRepository = apiVisitRepository;
    private readonly IIpGeolocationService _ipGeolocationService = ipGeolocationService;

    public async Task<IReadOnlyList<VisitorActivityRowDto>> GetAsync(
        DateTimeOffset from,
        DateTimeOffset to,
        CancellationToken cancellationToken = default)
    {
        if (from > to)
        {
            throw new BadRequestException("The from datetime must be earlier than or equal to the to datetime.", "INVALID_DATE_RANGE");
        }

        var groupedVisits = await _apiVisitRepository.GetGroupedByDayAndIpAsync(from, to, cancellationToken);
        var ipAddresses = groupedVisits
            .Select(visit => visit.IpAddress.ToString())
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        var geolocationByIp = await _ipGeolocationService.GetByIpAddressesAsync(ipAddresses, cancellationToken);

        return groupedVisits
            .Select(visit =>
            {
                var ip = visit.IpAddress.ToString();
                geolocationByIp.TryGetValue(ip, out var geolocation);

                return new VisitorActivityRowDto
                {
                    Day = DateOnly.FromDateTime(DateTime.SpecifyKind(visit.DayUtc, DateTimeKind.Utc)),
                    Ip = ip,
                    Country = geolocation?.Country,
                    City = geolocation?.City
                };
            })
            .ToArray();
    }
}