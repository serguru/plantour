using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("sitemap_urls", Schema = "plantour")]
[Index("Url", Name = "sitemap_urls_url_key", IsUnique = true)]
public partial class SitemapUrl
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("url")]
    public string Url { get; set; } = null!;

    [Column("last_modified", TypeName = "timestamp without time zone")]
    public DateTime LastModified { get; set; }

    [Column("priority")]
    public int? Priority { get; set; }

    [Column("is_active")]
    public bool? IsActive { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }
}
