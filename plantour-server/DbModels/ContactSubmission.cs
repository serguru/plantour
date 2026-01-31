using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Net;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("contact_submissions", Schema = "plantour")]
[Index("Email", Name = "idx_contact_email")]
[Index("ContactStatus", Name = "idx_contact_status")]
public partial class ContactSubmission
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("full_name")]
    public string FullName { get; set; } = null!;

    [Column("email")]
    [StringLength(255)]
    public string Email { get; set; } = null!;

    [Column("phone_number")]
    public string? PhoneNumber { get; set; }

    [Column("subject_category")]
    public string? SubjectCategory { get; set; }

    [Column("message_body")]
    public string MessageBody { get; set; } = null!;

    [Column("contact_status")]
    public string? ContactStatus { get; set; }

    [Column("assigned_agent_id")]
    public Guid? AssignedAgentId { get; set; }

    [Column("internal_notes")]
    public string? InternalNotes { get; set; }

    [Column("ip_address")]
    public IPAddress? IpAddress { get; set; }

    [Column("user_agent")]
    public string? UserAgent { get; set; }

    [Column("referrer_url")]
    public string? ReferrerUrl { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }
}
