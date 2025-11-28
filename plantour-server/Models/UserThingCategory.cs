using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.Models;

[Table("user_thing_categories", Schema = "plantour")]
[Index("UserId", "Name", Name = "idx_user_thing_categories_user_id_name", IsUnique = true)]
public partial class UserThingCategory
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("name")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("UserThingCategories")]
    public virtual User User { get; set; } = null!;

    [InverseProperty("Category")]
    public virtual ICollection<UserThing> UserThings { get; set; } = new List<UserThing>();
}
