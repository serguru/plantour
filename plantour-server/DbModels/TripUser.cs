using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trip_users", Schema = "plantour")]
[Index("TripId", "UserId", Name = "idx_trip_users_trip_id_user_id", IsUnique = true)]
public partial class TripUser
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_id")]
    public Guid TripId { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [ForeignKey("TripId")]
    [InverseProperty("TripUsers")]
    public virtual Trip Trip { get; set; } = null!;

    [InverseProperty("TripUser")]
    public virtual ICollection<TripUserPackage> TripUserPackages { get; set; } = new List<TripUserPackage>();

    [InverseProperty("TripUser")]
    public virtual ICollection<TripUserThing> TripUserThings { get; set; } = new List<TripUserThing>();

    [ForeignKey("UserId")]
    [InverseProperty("TripUsers")]
    public virtual User User { get; set; } = null!;
}
