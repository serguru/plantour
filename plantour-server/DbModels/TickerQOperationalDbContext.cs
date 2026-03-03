using Microsoft.EntityFrameworkCore;
using TickerQ.EntityFrameworkCore.DbContextFactory;
using TickerQ.Utilities.Entities;

namespace plantour_server.DbModels;

public class TickerQOperationalDbContext : TickerQDbContext<TimeTickerEntity, CronTickerEntity>
{
    public TickerQOperationalDbContext(DbContextOptions<TickerQOperationalDbContext> options)
        : base(options)
    {
    }
}