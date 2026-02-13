using System;
using NpgsqlTypes;
using Serilog.Events;
using Serilog.Sinks.PostgreSQL;

namespace plantour_server.Utils.Logging;

public sealed class UnspecifiedUtcTimestampColumnWriter : ColumnWriterBase
{
    public UnspecifiedUtcTimestampColumnWriter() : base(NpgsqlDbType.Timestamp)
    {
    }

    public override object GetValue(LogEvent logEvent, IFormatProvider? formatProvider = null)
    {
        var utc = logEvent.Timestamp.UtcDateTime;
        return DateTime.SpecifyKind(utc, DateTimeKind.Unspecified);
    }
}
