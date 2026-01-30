using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Net;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("api_visits", Schema = "plantour")]
[Index("CreatedAt", Name = "idx_api_visits_created_at", AllDescending = true)]
[Index("Endpoint", Name = "idx_api_visits_endpoint")]
[Index("Path", Name = "idx_api_visits_path")]
[Index("StatusCode", Name = "idx_api_visits_status_code")]
[Index("UserId", Name = "idx_api_visits_user_id")]
public partial class ApiVisit
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("method")]
    [StringLength(16)]
    public string? Method { get; set; }

    [Column("path")]
    [StringLength(1024)]
    public string? Path { get; set; }

    [Column("query_string")]
    [StringLength(2048)]
    public string? QueryString { get; set; }

    [Column("endpoint")]
    [StringLength(1024)]
    public string? Endpoint { get; set; }

    [Column("status_code")]
    public int? StatusCode { get; set; }

    [Column("duration_ms")]
    public int? DurationMs { get; set; }

    [Column("ip_address")]
    public IPAddress? IpAddress { get; set; }

    [Column("forwarded_for")]
    [StringLength(255)]
    public string? ForwardedFor { get; set; }

    [Column("user_agent")]
    [StringLength(1024)]
    public string? UserAgent { get; set; }

    [Column("referrer")]
    [StringLength(2048)]
    public string? Referrer { get; set; }

    [Column("host")]
    [StringLength(255)]
    public string? Host { get; set; }

    [Column("scheme")]
    [StringLength(16)]
    public string? Scheme { get; set; }

    [Column("protocol")]
    [StringLength(32)]
    public string? Protocol { get; set; }

    [Column("request_id")]
    [StringLength(128)]
    public string? RequestId { get; set; }

    [Column("request_size_bytes")]
    public long? RequestSizeBytes { get; set; }

    [Column("user_id")]
    public Guid? UserId { get; set; }

    [Column("user_email")]
    [StringLength(320)]
    public string? UserEmail { get; set; }

    [Column("user_role")]
    [StringLength(64)]
    public string? UserRole { get; set; }
}
