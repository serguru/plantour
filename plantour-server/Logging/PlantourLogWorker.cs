using Microsoft.Extensions.Hosting;
using Npgsql;
using NpgsqlTypes;

namespace plantour_server.Logging;

public sealed class PlantourLogWorker(
    PlantourLogQueue queue,
    NpgsqlDataSource dataSource,
    PlantourLoggerSettingsStore settingsStore) : BackgroundService
{
    private const string InsertSql = """
        insert into plantour.logs (id, created_at, severity, category, message, user_id, properties)
        values (@id, @created_at, @severity, @category, @message, @user_id, @properties)
        """;

    private readonly PlantourLogQueue _queue = queue;
    private readonly NpgsqlDataSource _dataSource = dataSource;
    private readonly PlantourLoggerSettingsStore _settingsStore = settingsStore;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var batch = new List<PlantourLogEntry>();

        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                if (!await _queue.WaitToReadAsync(stoppingToken))
                {
                    break;
                }

                while (_queue.TryRead(out var pendingEntry))
                {
                    batch.Add(pendingEntry);

                    if (batch.Count >= GetBatchSize())
                    {
                        break;
                    }
                }

                await GatherBatchAsync(batch, stoppingToken);
                await FlushBatchAsync(batch, stoppingToken);
                batch.Clear();
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
        }

        while (_queue.TryRead(out var pendingEntry))
        {
            batch.Add(pendingEntry);
            if (batch.Count >= GetBatchSize())
            {
                await FlushBatchAsync(batch, CancellationToken.None);
                batch.Clear();
            }
        }

        if (batch.Count > 0)
        {
            await FlushBatchAsync(batch, CancellationToken.None);
        }
    }

    private async Task GatherBatchAsync(List<PlantourLogEntry> batch, CancellationToken cancellationToken)
    {
        var flushDelay = Math.Max(250, _settingsStore.Current.FlushIntervalMilliseconds);
        using var timerCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timerCts.CancelAfter(flushDelay);

        try
        {
            while (batch.Count < GetBatchSize() && await _queue.WaitToReadAsync(timerCts.Token))
            {
                while (batch.Count < GetBatchSize() && _queue.TryRead(out var pendingEntry))
                {
                    batch.Add(pendingEntry);
                }
            }
        }
        catch (OperationCanceledException) when (timerCts.IsCancellationRequested)
        {
        }
    }

    private async Task FlushBatchAsync(IReadOnlyList<PlantourLogEntry> batch, CancellationToken cancellationToken)
    {
        if (batch.Count == 0)
        {
            return;
        }

        var sink = _settingsStore.Current.Sink;
        var writeToConsole = IsConsoleSink(sink);
        var writeToDatabase = IsDatabaseSink(sink);

        if (writeToConsole)
        {
            WriteToConsole(batch);
        }

        if (!writeToDatabase)
        {
            return;
        }

        try
        {
            await WriteToDatabaseAsync(batch, cancellationToken);
        }
        catch (Exception exception)
        {
            if (_settingsStore.Current.ConsoleFallbackEnabled)
            {
                Console.Error.WriteLine($"[{DateTime.UtcNow:O}] [logger-worker-error] {exception}");
                if (!writeToConsole)
                {
                    WriteToConsole(batch);
                }
            }
        }
    }

    private async Task WriteToDatabaseAsync(IReadOnlyList<PlantourLogEntry> batch, CancellationToken cancellationToken)
    {
        await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        await using var npgsqlBatch = new NpgsqlBatch(connection, transaction);

        foreach (var entry in batch)
        {
            var command = new NpgsqlBatchCommand(InsertSql);
            command.Parameters.Add(new NpgsqlParameter<Guid>("id", entry.Id));
            command.Parameters.Add(new NpgsqlParameter<DateTime>("created_at", entry.CreatedAtUtc));
            command.Parameters.Add(new NpgsqlParameter<string>("severity", entry.Severity));
            command.Parameters.Add(new NpgsqlParameter("category", NpgsqlDbType.Text)
            {
                Value = entry.Category ?? (object)DBNull.Value
            });
            command.Parameters.Add(new NpgsqlParameter<string>("message", entry.Message));
            command.Parameters.Add(new NpgsqlParameter("user_id", NpgsqlDbType.Uuid)
            {
                Value = entry.UserId ?? (object)DBNull.Value
            });
            command.Parameters.Add(new NpgsqlParameter("properties", NpgsqlDbType.Jsonb)
            {
                Value = entry.Properties ?? (object)DBNull.Value
            });
            npgsqlBatch.BatchCommands.Add(command);
        }

        await npgsqlBatch.ExecuteNonQueryAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }

    private static void WriteToConsole(IEnumerable<PlantourLogEntry> batch)
    {
        foreach (var entry in batch)
        {
            var line = string.IsNullOrWhiteSpace(entry.Category)
                ? $"[{entry.CreatedAtUtc:O}] [{entry.Severity}] {entry.Message}"
                : $"[{entry.CreatedAtUtc:O}] [{entry.Severity}] {entry.Category}: {entry.Message}";
            if (entry.Severity == "e")
            {
                Console.Error.WriteLine(line);
                continue;
            }

            Console.WriteLine(line);
        }
    }

    private int GetBatchSize()
    {
        return Math.Max(1, _settingsStore.Current.BatchSize);
    }

    private static bool IsConsoleSink(string? sink)
    {
        return string.Equals(sink, PlantourLogSinks.Console, StringComparison.OrdinalIgnoreCase)
            || string.Equals(sink, PlantourLogSinks.Both, StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsDatabaseSink(string? sink)
    {
        return string.Equals(sink, PlantourLogSinks.Database, StringComparison.OrdinalIgnoreCase)
            || string.Equals(sink, PlantourLogSinks.Both, StringComparison.OrdinalIgnoreCase);
    }
}