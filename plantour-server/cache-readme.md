# HybridCache in plantour-server

This project uses **HybridCache** for REST API data caching.

## Official Microsoft docs

- HybridCache library in ASP.NET Core: https://learn.microsoft.com/en-us/aspnet/core/performance/caching/hybrid
- Caching overview in ASP.NET Core: https://learn.microsoft.com/en-us/aspnet/core/performance/caching/overview
- .NET caching overview (includes HybridCache): https://learn.microsoft.com/en-us/dotnet/core/extensions/caching

## What was added in this project

1. NuGet package:
   - `Microsoft.Extensions.Caching.Hybrid`
2. DI registration in `Program.cs`:
   - `builder.Services.AddHybridCache(...)`
   - global limits:
     - `MaximumPayloadBytes = 1 MB`
     - `MaximumKeyLength = 1024`
   - default options:
     - distributed expiration: 10 minutes
     - local (in-memory) expiration: 5 minutes
3. First cached API data path:
   - `LookupsService.GetAllLookupsAsync()`
   - key: `lookups:all:v1`
   - entry options:
     - distributed expiration: 30 minutes
     - local expiration: 10 minutes

## How to use HybridCache in services

Inject `HybridCache` into your service constructor:

```csharp
public class ExampleService(HybridCache cache)
{
    private readonly HybridCache _cache = cache;
}
```

Use `GetOrCreateAsync` for read operations:

```csharp
return await _cache.GetOrCreateAsync(
    $"entity:{entityId}",
    async cancel => await LoadEntityFromDbAsync(entityId),
    new HybridCacheEntryOptions
    {
        Expiration = TimeSpan.FromMinutes(15),
        LocalCacheExpiration = TimeSpan.FromMinutes(5)
    },
    cancellationToken: cancellationToken);
```

## Cache key guidance (important)

From Microsoft guidance:

- Keys must uniquely identify data.
- Don’t use raw untrusted user input directly in keys.
- Prefer stable, structured keys, for example:
  - `trip:{tripId}:dashboard`
  - `user:{userId}:prefs`
- Keep keys below configured max length.

## Invalidating cache when data changes

When data is updated, remove related cache entries:

```csharp
await _cache.RemoveAsync("lookups:all:v1", cancellationToken);
```

For grouped invalidation, use tags:

```csharp
await _cache.RemoveByTagAsync("trip:123", cancellationToken);
```

You can invalidate all HybridCache entries logically with wildcard tag:

```csharp
await _cache.RemoveByTagAsync("*", cancellationToken);
```

## Distributed cache note

HybridCache works even without `IDistributedCache` configured:

- You still get in-memory cache + stampede protection.
- To enable L2 distributed cache across multiple servers, register an `IDistributedCache` provider (for example Redis) in DI.

Example with Redis:

```csharp
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("RedisConnectionString");
});

builder.Services.AddHybridCache();
```

## Recommended next step for plantour-server

Add targeted invalidation in write paths that affect cached reads (for example, if lookup dictionaries become editable in admin features).