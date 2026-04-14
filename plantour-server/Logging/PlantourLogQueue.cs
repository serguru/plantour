using System.Diagnostics.CodeAnalysis;
using System.Threading.Channels;

namespace plantour_server.Logging;

public sealed class PlantourLogQueue
{
    private readonly Channel<PlantourLogEntry> _channel;

    public PlantourLogQueue(PlantourLoggerSettingsStore settingsStore)
    {
        var capacity = Math.Max(128, settingsStore.Current.QueueCapacity);
        _channel = Channel.CreateBounded<PlantourLogEntry>(new BoundedChannelOptions(capacity)
        {
            FullMode = BoundedChannelFullMode.DropOldest,
            SingleReader = true,
            SingleWriter = false
        });
    }

    public bool TryEnqueue(PlantourLogEntry entry)
    {
        return _channel.Writer.TryWrite(entry);
    }

    public ValueTask<bool> WaitToReadAsync(CancellationToken cancellationToken)
    {
        return _channel.Reader.WaitToReadAsync(cancellationToken);
    }

    public bool TryRead([MaybeNullWhen(false)] out PlantourLogEntry entry)
    {
        return _channel.Reader.TryRead(out entry);
    }

    public void Complete()
    {
        _channel.Writer.TryComplete();
    }
}