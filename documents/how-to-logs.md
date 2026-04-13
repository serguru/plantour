# Plantour Logs

This document describes how logging works in `plantour-server`.

## Overview

`plantour-server` uses a dedicated Plantour logger abstraction.

The flow is:

1. Application code writes through `IPlantourLogger<T>`.
2. The Plantour logger accepts only `Information`, `Warning`, `Error`, and `Critical` messages.
3. Messages are placed into an in-memory bounded queue.
4. A background worker flushes queued items asynchronously.
5. Logs are written to the console, PostgreSQL, or both, depending on configuration.

Current implementation files:

- `plantour-server/Logging/IPlantourLogger.cs`
- `plantour-server/Logging/PlantourLogger.cs`
- `plantour-server/Logging/PlantourLogQueue.cs`
- `plantour-server/Logging/PlantourLogWorker.cs`
- `plantour-server/Logging/PlantourLoggerOptions.cs`

## Database Table

The database sink writes to `plantour.logs`.

Expected columns:

- `id uuid`
- `created_at timestamptz`
- `severity text`
- `category text`
- `message text`
- `user_id uuid`
- `properties jsonb`

Severity mapping:

- `Information` -> `i`
- `Warning` -> `w`
- `Error` -> `e`
- `Critical` -> `e`

## Configuration

Logging is configured through the `PlantourLogging` section in appsettings.

Example:

```json
"PlantourLogging": {
  "Sink": "Console",
  "MinimumLevel": "Information",
  "QueueCapacity": 1024,
  "BatchSize": 50,
  "FlushIntervalMilliseconds": 2000,
  "ConsoleFallbackEnabled": true
}
```

Available settings:

- `Sink`: `Console`, `Database`, or `Both`
- `MinimumLevel`: standard `LogLevel` name, for example `Information`, `Warning`, `Error`
- `QueueCapacity`: max number of queued log records before the queue starts dropping older messages
- `BatchSize`: max number of messages written in one flush
- `FlushIntervalMilliseconds`: max wait time before the worker flushes a partial batch
- `ConsoleFallbackEnabled`: if `true`, database write failures are printed to console

Default environment behavior currently configured:

- Development: `Console`
- QA: `Database`
- Production: `Database`

## Category Source

The stored `category` value comes from the generic type used when injecting `IPlantourLogger<T>`.

Examples:

- `IPlantourLogger<TripUserService>` -> `plantour_server.Services.TripUserService`
- `IPlantourLogger<GlobalExceptionHandler>` -> `PlantourApi.Middleware.GlobalExceptionHandler`

Because Plantour logging no longer plugs into the ASP.NET `ILogger` provider pipeline, framework and library code cannot write into the Plantour log sink unless Plantour explicitly injects and uses `IPlantourLogger<T>`.

## Logged Properties

Besides the main `message`, the logger stores extra metadata in `properties` as JSON.

Potential fields include:

- `original_format`
- structured template values from the Plantour message template
- `request_path`
- `request_method`
- `trace_id`
- `exception_type`
- `exception_message`
- `stack_trace`

If the request is authenticated, `user_id` is also resolved from `CurrentUserMiddleware` and written into the `user_id` column.

## How To Write Logs

Inject `IPlantourLogger<T>` into the service, middleware, or controller.

Example:

```csharp
public sealed class ExampleService(IPlantourLogger<ExampleService> logger)
{
  private readonly IPlantourLogger<ExampleService> _logger = logger;

    public void Run(Guid tripId)
    {
        _logger.LogInformation("Processing trip {TripId}", tripId);
    }
}
```

For warnings:

```csharp
_logger.LogWarning("Skipped sync for trip {TripId}", tripId);
```

For errors:

```csharp
_logger.LogError(exception, "Failed to process trip {TripId}", tripId);
```

## Practical Rules

- Prefer structured message templates over string interpolation.
- Put important identifiers into template parameters, not inside free text.
- Use `LogWarning` for recoverable problems.
- Use `LogError` for failed operations.
- Use `LogInformation` for meaningful business or operational events, not noisy per-step tracing.

Good:

```csharp
_logger.LogWarning("Exchange rate lookup failed for {FromCurrency} -> {ToCurrency}", from, to);
```

Avoid:

```csharp
_logger.LogWarning($"Exchange rate lookup failed for {from} -> {to}");
```

## Queue And Failure Behavior

- Logging is asynchronous.
- Request processing does not wait for the database insert.
- The queue is bounded.
- When the queue is full, older messages may be dropped.
- If database writing fails and console fallback is enabled, the worker prints the failure and the affected log lines to console.

This design keeps logging from breaking API requests.

## Sink Selection

Use `Console` when:

- running locally
- relying on container stdout
- debugging logger behavior itself

Use `Database` when:

- logs must be queryable from PostgreSQL
- maintenance tooling reads from `plantour.logs`

Use `Both` when:

- you want PostgreSQL persistence and stdout visibility at the same time

## Current Limitation

No log call sites were added or re-enabled as part of the initial logger wiring.

That means the infrastructure is ready, but application code still needs explicit `ILogger<T>` calls where logging is wanted.