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
    public string? Method { get; set; }

    [Column("path")]
    public string? Path { get; set; }

    [Column("query_string")]
    public string? QueryString { get; set; }

    [Column("endpoint")]
    public string? Endpoint { get; set; }

    [Column("status_code")]
    public int? StatusCode { get; set; }

    [Column("duration_ms")]
    public int? DurationMs { get; set; }

    [Column("ip_address")]
    public IPAddress? IpAddress { get; set; }

    [Column("forwarded_for")]
    public string? ForwardedFor { get; set; }

    [Column("user_agent")]
    public string? UserAgent { get; set; }

    [Column("referrer")]
    public string? Referrer { get; set; }

    [Column("host")]
    public string? Host { get; set; }

    [Column("scheme")]
    public string? Scheme { get; set; }

    [Column("protocol")]
    public string? Protocol { get; set; }

    [Column("request_id")]
    public string? RequestId { get; set; }

    [Column("request_size_bytes")]
    public long? RequestSizeBytes { get; set; }

    [Column("user_id")]
    public Guid? UserId { get; set; }

    [Column("user_email")]
    public string? UserEmail { get; set; }

    [Column("user_role")]
    public string? UserRole { get; set; }
}
