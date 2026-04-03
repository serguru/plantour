using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("currencies", Schema = "plantour")]
[Index("Name", Name = "currencies_name_key", IsUnique = true)]
public partial class Currency
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [InverseProperty("Currency")]
    public virtual ICollection<TripUserExpense> TripUserExpenses { get; set; } = new List<TripUserExpense>();

    [InverseProperty("Currency")]
    public virtual ICollection<Trip> Trips { get; set; } = new List<Trip>();

    [InverseProperty("Currency")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
