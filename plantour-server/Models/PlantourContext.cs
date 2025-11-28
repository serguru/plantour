using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.Models;

public partial class PlantourContext : DbContext
{
    public PlantourContext(DbContextOptions<PlantourContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AdminsParticipant> AdminsParticipants { get; set; }

    public virtual DbSet<CommunicationType> CommunicationTypes { get; set; }

    public virtual DbSet<Currency> Currencies { get; set; }

    public virtual DbSet<Invitation> Invitations { get; set; }

    public virtual DbSet<PackingStatus> PackingStatuses { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<Trip> Trips { get; set; }

    public virtual DbSet<TripStatus> TripStatuses { get; set; }

    public virtual DbSet<TripUser> TripUsers { get; set; }

    public virtual DbSet<TripUserThing> TripUserThings { get; set; }

    public virtual DbSet<Unit> Units { get; set; }

    public virtual DbSet<UnitCategory> UnitCategories { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserPackage> UserPackages { get; set; }

    public virtual DbSet<UserPackageCategory> UserPackageCategories { get; set; }

    public virtual DbSet<UserThing> UserThings { get; set; }

    public virtual DbSet<UserThingCategory> UserThingCategories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AdminsParticipant>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("admins_participants_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.Admin).WithMany(p => p.AdminsParticipantAdmins).HasConstraintName("admins_participants_admin_id_fkey");

            entity.HasOne(d => d.Participant).WithMany(p => p.AdminsParticipantParticipants).HasConstraintName("admins_participants_participant_id_fkey");
        });

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

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("refresh_tokens_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.User).WithMany(p => p.RefreshTokens).HasConstraintName("fk_refresh_tokens_user");
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

        modelBuilder.Entity<TripUser>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("trip_users_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.Trip).WithMany(p => p.TripUsers).HasConstraintName("trip_users_trip_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.TripUsers).HasConstraintName("trip_users_user_id_fkey");
        });

        modelBuilder.Entity<TripUserThing>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("trip_user_things_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.PackingStatus).WithMany(p => p.TripUserThings)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("trip_user_things_packing_status_id_fkey");

            entity.HasOne(d => d.TripUser).WithMany(p => p.TripUserThings).HasConstraintName("trip_user_things_trip_user_id_fkey");

            entity.HasOne(d => d.UserPackage).WithMany(p => p.TripUserThings)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("trip_user_things_user_package_id_fkey");

            entity.HasOne(d => d.UserThing).WithMany(p => p.TripUserThings).HasConstraintName("trip_user_things_user_thing_id_fkey");
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

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<UserPackage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_packages_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.CapacityUnit).WithMany(p => p.UserPackageCapacityUnits).HasConstraintName("user_packages_capacity_unit_id_fkey");

            entity.HasOne(d => d.Category).WithMany(p => p.UserPackages).HasConstraintName("user_packages_category_id_fkey");

            entity.HasOne(d => d.DimensionUnit).WithMany(p => p.UserPackageDimensionUnits).HasConstraintName("user_packages_dimension_unit_id_fkey");

            entity.HasOne(d => d.ParentPackage).WithMany(p => p.InverseParentPackage)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("user_packages_parent_package_id_fkey");

            entity.HasOne(d => d.WeightUnit).WithMany(p => p.UserPackageWeightUnits).HasConstraintName("user_packages_weight_unit_id_fkey");
        });

        modelBuilder.Entity<UserPackageCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_package_categories_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.User).WithMany(p => p.UserPackageCategories).HasConstraintName("user_package_categories_user_id_fkey");
        });

        modelBuilder.Entity<UserThing>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_things_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.Category).WithMany(p => p.UserThings).HasConstraintName("user_things_category_id_fkey");

            entity.HasOne(d => d.DimensionUnit).WithMany(p => p.UserThingDimensionUnits).HasConstraintName("user_things_dimension_unit_id_fkey");

            entity.HasOne(d => d.PurchaseCurrency).WithMany(p => p.UserThings).HasConstraintName("user_things_purchase_currency_id_fkey");

            entity.HasOne(d => d.WeightUnit).WithMany(p => p.UserThingWeightUnits).HasConstraintName("user_things_weight_unit_id_fkey");
        });

        modelBuilder.Entity<UserThingCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_thing_categories_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.User).WithMany(p => p.UserThingCategories).HasConstraintName("user_thing_categories_user_id_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
