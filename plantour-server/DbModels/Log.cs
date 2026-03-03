using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

/// <summary>
/// stores application log events from serilog framework
/// </summary>
[Table("logs", Schema = "plantour")]
[Index("Level", Name = "idx_logs_level")]
[Index("MessageTemplate", Name = "idx_logs_message_template")]
[Index("TimeStamp", Name = "idx_logs_timestamp", AllDescending = true)]
public partial class Log
{
    /// <summary>
    /// auto-incrementing primary key
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// the log message template with placeholders
    /// </summary>
    [Column("message_template")]
    public string? MessageTemplate { get; set; }

    /// <summary>
    /// log level: verbose, debug, information, warning, error, fatal
    /// </summary>
    [Column("level")]
    public string? Level { get; set; }

    /// <summary>
    /// timestamp when the log event was recorded
    /// </summary>
    [Column("time_stamp", TypeName = "timestamp without time zone")]
    public DateTime TimeStamp { get; set; }

    /// <summary>
    /// exception details if applicable
    /// </summary>
    [Column("exception")]
    public string? Exception { get; set; }

    /// <summary>
    /// complete log event as json
    /// </summary>
    [Column("log_event")]
    public string? LogEvent { get; set; }

    /// <summary>
    /// additional structured properties as json (enrichers, context data)
    /// </summary>
    [Column("properties", TypeName = "jsonb")]
    public string? Properties { get; set; }

    [Column("event_type")]
    public string? EventType { get; set; }

    [Column("subtype")]
    public string? Subtype { get; set; }
}
