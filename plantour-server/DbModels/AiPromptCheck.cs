using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("ai_prompt_checks", Schema = "plantour")]
public partial class AiPromptCheck
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("start")]
    public DateTime Start { get; set; }

    [Column("count")]
    public int Count { get; set; }

    [ForeignKey("Id")]
    [InverseProperty("AiPromptCheck")]
    public virtual User IdNavigation { get; set; } = null!;
}
