using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("ai_prompts", Schema = "plantour_v2")]
[Index("Prompt", Name = "idx_ai_prompts_prompt")]
public partial class AiPrompt
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("prompt")]
    public string Prompt { get; set; } = null!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("Prompt")]
    public virtual ICollection<AiThing> AiThings { get; set; } = new List<AiThing>();

    [ForeignKey("UserId")]
    [InverseProperty("AiPrompts")]
    public virtual User User { get; set; } = null!;
}
