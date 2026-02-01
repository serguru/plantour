using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("ai_things", Schema = "plantour")]
[Index("PromptId", "Name", Name = "idx_ai_prompts_prompt_id_name", IsUnique = true)]
public partial class AiThing
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("prompt_id")]
    public Guid PromptId { get; set; }

    [Column("category")]
    public string? Category { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("units")]
    public string? Units { get; set; }

    [Column("value")]
    [Precision(10, 3)]
    public decimal? Value { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey("PromptId")]
    [InverseProperty("AiThings")]
    public virtual AiPrompt Prompt { get; set; } = null!;
}
