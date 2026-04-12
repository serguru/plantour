using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_maintenance_server.Repositories;

public sealed class ApiVisitRepository(PlantourContext context)
{
    private readonly PlantourContext _context = context;

    public async Task<IReadOnlyList<DailyIpVisitRecord>> GetGroupedByDayAndIpAsync(
        DateTimeOffset from,
        DateTimeOffset to,
        CancellationToken cancellationToken = default)
    {
        var fromUtc = from.UtcDateTime;
        var toInclusiveUtc = to.UtcDateTime;

        var visits = await _context.ApiVisits
            .AsNoTracking()
            .Where(visit => visit.CreatedAt >= fromUtc && visit.CreatedAt <= toInclusiveUtc)
            .Where(visit => visit.IpAddress != null)
            .Select(visit => new
            {
                visit.CreatedAt,
                visit.IpAddress
            })
            .ToListAsync(cancellationToken);

        var rows = visits
            .GroupBy(visit => new
            {
                Day = DateOnly.FromDateTime(DateTime.SpecifyKind(visit.CreatedAt, DateTimeKind.Utc)).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc),
                visit.IpAddress
            })
            .Select(group => new DailyIpVisitRecord(
                group.Key.Day,
                group.Key.IpAddress!))
            .OrderByDescending(row => row.DayUtc)
            .ThenBy(row => row.IpAddress.ToString(), StringComparer.Ordinal)
            .ToList();

        return rows;
    }
}

public sealed record DailyIpVisitRecord(DateTime DayUtc, System.Net.IPAddress IpAddress);