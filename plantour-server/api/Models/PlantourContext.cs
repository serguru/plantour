using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

public partial class PlantourContext : DbContext
{
    public PlantourContext(DbContextOptions<PlantourContext> options)
        : base(options)
    {
    }

    public virtual DbSet<CommunicationType> CommunicationTypes { get; set; }

    public virtual DbSet<Currency> Currencies { get; set; }

    public virtual DbSet<Invitation> Invitations { get; set; }

    public virtual DbSet<PackingStatus> PackingStatuses { get; set; }

    public virtual DbSet<Traveler> Travelers { get; set; }

    public virtual DbSet<TravelerPackage> TravelerPackages { get; set; }

    public virtual DbSet<TravelerPackageCategory> TravelerPackageCategories { get; set; }

    public virtual DbSet<TravelerThing> TravelerThings { get; set; }

    public virtual DbSet<TravelerThingCategory> TravelerThingCategories { get; set; }

    public virtual DbSet<Trip> Trips { get; set; }

    public virtual DbSet<TripStatus> TripStatuses { get; set; }

    public virtual DbSet<TripTraveler> TripTravelers { get; set; }

    public virtual DbSet<TripTravelerThing> TripTravelerThings { get; set; }

    public virtual DbSet<Unit> Units { get; set; }

    public virtual DbSet<UnitCategory> UnitCategories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CommunicationType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("communication_types_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<Currency>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("currencies_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<Invitation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("invitations_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.CommunicationType).WithMany(p => p.Invitations)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("invitations_communication_type_id_fkey");

            entity.HasOne(d => d.Invitee).WithMany(p => p.InvitationInvitees).HasConstraintName("invitations_invitee_id_fkey");

            entity.HasOne(d => d.Inviter).WithMany(p => p.InvitationInviters).HasConstraintName("invitations_inviter_id_fkey");

            entity.HasOne(d => d.Trip).WithMany(p => p.Invitations).HasConstraintName("invitations_trip_id_fkey");
        });

        modelBuilder.Entity<PackingStatus>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("packing_status_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<Traveler>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("travelers_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.Admin).WithMany(p => p.InverseAdmin)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("travelers_admin_id_fkey");
        });

        modelBuilder.Entity<TravelerPackage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("traveler_packages_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.CapacityUnit).WithMany(p => p.TravelerPackageCapacityUnits).HasConstraintName("traveler_packages_capacity_unit_id_fkey");

            entity.HasOne(d => d.Category).WithMany(p => p.TravelerPackages).HasConstraintName("traveler_packages_category_id_fkey");

            entity.HasOne(d => d.DimensionUnit).WithMany(p => p.TravelerPackageDimensionUnits).HasConstraintName("traveler_packages_dimension_unit_id_fkey");

            entity.HasOne(d => d.ParentPackage).WithMany(p => p.InverseParentPackage)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("traveler_packages_parent_package_id_fkey");

            entity.HasOne(d => d.WeightUnit).WithMany(p => p.TravelerPackageWeightUnits).HasConstraintName("traveler_packages_weight_unit_id_fkey");
        });

        modelBuilder.Entity<TravelerPackageCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("traveler_package_categories_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.Traveler).WithMany(p => p.TravelerPackageCategories).HasConstraintName("traveler_package_categories_traveler_id_fkey");
        });

        modelBuilder.Entity<TravelerThing>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("traveler_things_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.Category).WithMany(p => p.TravelerThings).HasConstraintName("traveler_things_category_id_fkey");

            entity.HasOne(d => d.DimensionUnit).WithMany(p => p.TravelerThingDimensionUnits).HasConstraintName("traveler_things_dimension_unit_id_fkey");

            entity.HasOne(d => d.PurchaseCurrency).WithMany(p => p.TravelerThings).HasConstraintName("traveler_things_purchase_currency_id_fkey");

            entity.HasOne(d => d.WeightUnit).WithMany(p => p.TravelerThingWeightUnits).HasConstraintName("traveler_things_weight_unit_id_fkey");
        });

        modelBuilder.Entity<TravelerThingCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("traveler_thing_categories_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.Traveler).WithMany(p => p.TravelerThingCategories).HasConstraintName("traveler_thing_categories_traveler_id_fkey");
        });

        modelBuilder.Entity<Trip>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("trips_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.RequireWeight).HasDefaultValue(false);

            entity.HasOne(d => d.Owner).WithMany(p => p.Trips).HasConstraintName("trips_owner_id_fkey");

            entity.HasOne(d => d.TripStatus).WithMany(p => p.Trips)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("trips_trip_status_id_fkey");
        });

        modelBuilder.Entity<TripStatus>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("trip_status_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<TripTraveler>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("trip_travelers_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.Traveler).WithMany(p => p.TripTravelers).HasConstraintName("trip_travelers_traveler_id_fkey");

            entity.HasOne(d => d.Trip).WithMany(p => p.TripTravelers).HasConstraintName("trip_travelers_trip_id_fkey");
        });

        modelBuilder.Entity<TripTravelerThing>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("trip_traveler_things_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.PackingStatus).WithMany(p => p.TripTravelerThings)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("trip_traveler_things_packing_status_id_fkey");

            entity.HasOne(d => d.TravelerPackage).WithMany(p => p.TripTravelerThings)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("trip_traveler_things_traveler_package_id_fkey");

            entity.HasOne(d => d.TravelerThing).WithMany(p => p.TripTravelerThings).HasConstraintName("trip_traveler_things_traveler_thing_id_fkey");

            entity.HasOne(d => d.TripTraveler).WithMany(p => p.TripTravelerThings).HasConstraintName("trip_traveler_things_trip_traveler_id_fkey");
        });

        modelBuilder.Entity<Unit>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("units_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.UnitCategory).WithMany(p => p.Units)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("units_unit_category_id_fkey");
        });

        modelBuilder.Entity<UnitCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("unit_categories_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
