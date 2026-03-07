using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

// TODO: add versioning to the app
public class PlanRepository : GenericRepository<Plan>
{
    private const string AllPlansCacheKey = "plans:all:v1";

    private static readonly HybridCacheEntryOptions PlanEntryOptions = new()
    {
        Expiration = TimeSpan.FromMinutes(30),
        LocalCacheExpiration = TimeSpan.FromMinutes(10)
    };

    private readonly HybridCache _cache;

    private sealed class PriceCacheItem
    {
        public Guid Id { get; init; }
        public Guid PlanId { get; init; }
        public string? PaddlePriceId { get; init; }
        public required string Name { get; init; }
        public required int ValueCents { get; init; }
    }

    private sealed class PlanCacheItem
    {
        public Guid Id { get; init; }
        public required string Name { get; init; }
        public string? PaddleProductId { get; init; }
        public string? Notes { get; init; }
        public bool? Active { get; init; }
        public bool? Public { get; init; }
        public int? AllowedItems { get; init; }
        public int? AllowedTravelers { get; init; }
        public int? AllowedAiPrompts { get; init; }
        public bool ExtendedAiAllowed { get; init; }
        public DateTime CreatedAt { get; init; }
        public List<PriceCacheItem> Prices { get; init; } = new();
    }

    public PlanRepository(PlantourContext context, HybridCache cache) : base(context)
    {
        _cache = cache;
    }

    private static Plan ToPlan(PlanCacheItem item)
    {
        var plan = new Plan
        {
            Id = item.Id,
            Name = item.Name,
            PaddleProductId = item.PaddleProductId,
            Notes = item.Notes,
            Active = item.Active,
            Public = item.Public,
            AllowedItems = item.AllowedItems,
            AllowedTravelers = item.AllowedTravelers,
            AllowedAiPrompts = item.AllowedAiPrompts,
            ExtendedAiAllowed = item.ExtendedAiAllowed,
            CreatedAt = item.CreatedAt,
            Prices = new List<Price>()
        };

        foreach (var priceItem in item.Prices)
        {
            var price = new Price
            {
                Id = priceItem.Id,
                PlanId = priceItem.PlanId,
                PaddlePriceId = priceItem.PaddlePriceId,
                Name = priceItem.Name,
                ValueCents = priceItem.ValueCents,
                Plan = plan
            };

            plan.Prices.Add(price);
        }

        return plan;
    }

    private async Task<List<PlanCacheItem>> GetAllPlansSnapshotAsync(CancellationToken cancellationToken = default)
    {
        return await _cache.GetOrCreateAsync(
            AllPlansCacheKey,
            async cancel => await _dbSet
                .AsNoTracking()
                .Include(p => p.Prices)
                .Select(p => new PlanCacheItem
                {
                    Id = p.Id,
                    Name = p.Name,
                    PaddleProductId = p.PaddleProductId,
                    Notes = p.Notes,
                    Active = p.Active,
                    Public = p.Public,
                    AllowedItems = p.AllowedItems,
                    AllowedTravelers = p.AllowedTravelers,
                    AllowedAiPrompts = p.AllowedAiPrompts,
                    ExtendedAiAllowed = p.ExtendedAiAllowed,
                    CreatedAt = p.CreatedAt,
                    Prices = p.Prices.Select(price => new PriceCacheItem
                    {
                        Id = price.Id,
                        PlanId = price.PlanId,
                        PaddlePriceId = price.PaddlePriceId,
                        Name = price.Name,
                        ValueCents = price.ValueCents
                    }).ToList()
                })
                .ToListAsync(cancel),
            PlanEntryOptions,
            cancellationToken: cancellationToken);
    }

    public async Task<IEnumerable<Plan>> GetAll()
    {
        var plans = await GetAllPlansSnapshotAsync();
        return plans.Select(ToPlan).ToList();
    }

    public async Task<Plan?> GetByNameAsync(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return null;
        }

        var plans = await GetAllPlansSnapshotAsync();
        var plan = plans.FirstOrDefault(x => x.Name == name);

        if (plan != null)
        {
            return ToPlan(plan);
        }

        var dbPlan = await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Name == name);

        if (dbPlan == null)
        {
            return null;
        }

        return new Plan
        {
            Id = dbPlan.Id,
            Name = dbPlan.Name,
            PaddleProductId = dbPlan.PaddleProductId,
            Notes = dbPlan.Notes,
            Active = dbPlan.Active,
            Public = dbPlan.Public,
            AllowedItems = dbPlan.AllowedItems,
            AllowedTravelers = dbPlan.AllowedTravelers,
            AllowedAiPrompts = dbPlan.AllowedAiPrompts,
            ExtendedAiAllowed = dbPlan.ExtendedAiAllowed,
            CreatedAt = dbPlan.CreatedAt
        };
    }

    public async Task<Plan?> GetByPriceIdAsync(string priceId)
    {
        if (string.IsNullOrWhiteSpace(priceId))
        {
            return null;
        }

        var plans = await GetAllPlansSnapshotAsync();
        var plan = plans.FirstOrDefault(x => x.Prices.Any(p => p.PaddlePriceId == priceId));

        if (plan != null)
        {
            return ToPlan(plan);
        }

        var dbPlan = await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Prices.Any(p => p.PaddlePriceId == priceId));

        if (dbPlan == null)
        {
            return null;
        }

        return new Plan
        {
            Id = dbPlan.Id,
            Name = dbPlan.Name,
            Notes = dbPlan.Notes,
            Active = dbPlan.Active,
            Public = dbPlan.Public,
            AllowedItems = dbPlan.AllowedItems,
            AllowedTravelers = dbPlan.AllowedTravelers,
            AllowedAiPrompts = dbPlan.AllowedAiPrompts,
            ExtendedAiAllowed = dbPlan.ExtendedAiAllowed,
            CreatedAt = dbPlan.CreatedAt
        };
    }


    public async Task<string?> GetPriceNameByPriceIdAsync(string priceId)
    {
        if (string.IsNullOrWhiteSpace(priceId))
        {
            return null;
        }
        var plans = await GetAllPlansSnapshotAsync();
        var price = plans.SelectMany(p => p.Prices).FirstOrDefault(p => p.PaddlePriceId == priceId);
        return price?.Name;
    }   

}