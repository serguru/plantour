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

    public virtual DbSet<PackageCategoriesJ> PackageCategoriesJs { get; set; }

    public virtual DbSet<PackagesJ> PackagesJs { get; set; }

    public virtual DbSet<ThingCategoriesJ> ThingCategoriesJs { get; set; }

    public virtual DbSet<ThingsJ> ThingsJs { get; set; }

    public virtual DbSet<Traveler> Travelers { get; set; }

    public virtual DbSet<TripThingsJ> TripThingsJs { get; set; }

    public virtual DbSet<TripTravelersJ> TripTravelersJs { get; set; }

    public virtual DbSet<TripsJ> TripsJs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresEnum("auth", "aal_level", new[] { "aal1", "aal2", "aal3" })
            .HasPostgresEnum("auth", "code_challenge_method", new[] { "s256", "plain" })
            .HasPostgresEnum("auth", "factor_status", new[] { "unverified", "verified" })
            .HasPostgresEnum("auth", "factor_type", new[] { "totp", "webauthn", "phone" })
            .HasPostgresEnum("auth", "oauth_authorization_status", new[] { "pending", "approved", "denied", "expired" })
            .HasPostgresEnum("auth", "oauth_client_type", new[] { "public", "confidential" })
            .HasPostgresEnum("auth", "oauth_registration_type", new[] { "dynamic", "manual" })
            .HasPostgresEnum("auth", "oauth_response_type", new[] { "code" })
            .HasPostgresEnum("auth", "one_time_token_type", new[] { "confirmation_token", "reauthentication_token", "recovery_token", "email_change_token_new", "email_change_token_current", "phone_change_token" })
            .HasPostgresEnum("realtime", "action", new[] { "INSERT", "UPDATE", "DELETE", "TRUNCATE", "ERROR" })
            .HasPostgresEnum("realtime", "equality_op", new[] { "eq", "neq", "lt", "lte", "gt", "gte", "in" })
            .HasPostgresEnum("storage", "buckettype", new[] { "STANDARD", "ANALYTICS", "VECTOR" })
            .HasPostgresExtension("extensions", "pg_stat_statements")
            .HasPostgresExtension("extensions", "pgcrypto")
            .HasPostgresExtension("extensions", "uuid-ossp")
            .HasPostgresExtension("graphql", "pg_graphql")
            .HasPostgresExtension("vault", "supabase_vault");

        modelBuilder.Entity<PackageCategoriesJ>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("package_categories_j_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Version).HasDefaultValue(1);

            entity.HasOne(d => d.Traveler).WithMany(p => p.PackageCategoriesJs).HasConstraintName("package_categories_j_traveler_id_fkey");
        });

        modelBuilder.Entity<PackagesJ>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("packages_j_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Version).HasDefaultValue(1);

            entity.HasOne(d => d.Category).WithMany(p => p.PackagesJs).HasConstraintName("packages_j_category_id_fkey");

            entity.HasOne(d => d.ParentPackage).WithMany(p => p.InverseParentPackage)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("packages_j_parent_package_id_fkey");
        });

        modelBuilder.Entity<ThingCategoriesJ>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("thing_categories_j_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Version).HasDefaultValue(1);

            entity.HasOne(d => d.Traveler).WithMany(p => p.ThingCategoriesJs).HasConstraintName("thing_categories_j_traveler_id_fkey");
        });

        modelBuilder.Entity<ThingsJ>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("things_j_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Version).HasDefaultValue(1);

            entity.HasOne(d => d.Category).WithMany(p => p.ThingsJs).HasConstraintName("things_j_category_id_fkey");
        });

        modelBuilder.Entity<Traveler>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("travelers_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.Admin).WithMany(p => p.InverseAdmin)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("travelers_admin_id_fkey");
        });

        modelBuilder.Entity<TripThingsJ>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("trip_things_j_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Version).HasDefaultValue(1);

            entity.HasOne(d => d.Package).WithMany(p => p.TripThingsJs)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("trip_things_j_package_id_fkey");

            entity.HasOne(d => d.Thing).WithMany(p => p.TripThingsJs).HasConstraintName("trip_things_j_thing_id_fkey");

            entity.HasOne(d => d.TripTraveler).WithMany(p => p.TripThingsJs).HasConstraintName("trip_things_j_trip_traveler_id_fkey");
        });

        modelBuilder.Entity<TripTravelersJ>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("trip_travelers_j_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Version).HasDefaultValue(1);

            entity.HasOne(d => d.Traveler).WithMany(p => p.TripTravelersJs).HasConstraintName("trip_travelers_j_traveler_id_fkey");

            entity.HasOne(d => d.Trip).WithMany(p => p.TripTravelersJs).HasConstraintName("trip_travelers_j_trip_id_fkey");
        });

        modelBuilder.Entity<TripsJ>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("trips_j_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Version).HasDefaultValue(1);

            entity.HasOne(d => d.User).WithMany(p => p.TripsJs)
                .HasPrincipalKey(p => p.UserId)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("trips_j_user_id_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
