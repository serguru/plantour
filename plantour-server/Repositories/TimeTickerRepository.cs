using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;
using TickerQ.Utilities.Enums;

namespace plantour_server.Repositories;

public class TimeTickerRepository(PlantourContext context) : GenericRepository<TimeTicker>(context)
{
    public async Task<TimeTicker?> GetLatestActiveByFunctionAndIdentifierAsync(
        string functionName,
        string initIdentifier)
    {
        if (string.IsNullOrWhiteSpace(functionName))
        {
            throw new ArgumentException("Function name is required", nameof(functionName));
        }
        return await _dbSet
            .AsNoTracking()
            .Where(t =>
                t.Function!.ToLower() == functionName!.ToLower() &&
                t.InitIdentifier == initIdentifier &&
                (t.Status == (int)TickerStatus.Idle ||
                 t.Status == (int)TickerStatus.Queued ||
                 t.Status == (int)TickerStatus.InProgress))
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<bool> CancelLatestActiveByFunctionAndIdentifierAsync(
        string functionName,
        string initIdentifier)
    {
        var ticker = await GetLatestActiveByFunctionAndIdentifierAsync(functionName, initIdentifier);

        if (ticker == null)
        {
            return false;
        }

        _dbSet.Remove(ticker);
        await _context.SaveChangesAsync();
        return true;
    }
}