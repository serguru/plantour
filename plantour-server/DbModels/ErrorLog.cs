using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Keyless]
public partial class ErrorLog
{
    [Column("id")]
    public int? Id { get; set; }

    [Column("time_stamp", TypeName = "timestamp without time zone")]
    public DateTime? TimeStamp { get; set; }

    [Column("level")]
    [StringLength(128)]
    public string? Level { get; set; }

    [Column("message_template")]
    public string? MessageTemplate { get; set; }

    [Column("exception")]
    public string? Exception { get; set; }

    [Column("properties", TypeName = "jsonb")]
    public string? Properties { get; set; }
}
