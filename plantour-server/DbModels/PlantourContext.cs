using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

public partial class PlantourContext : DbContext
{
    public PlantourContext(DbContextOptions<PlantourContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AdminsParticipant> AdminsParticipants { get; set; }

    public virtual DbSet<CommunicationType> CommunicationTypes { get; set; }

    public virtual DbSet<Invitation> Invitations { get; set; }

    public virtual DbSet<ParticipantStatus> ParticipantStatuses { get; set; }

    public virtual DbSet<ThingCategory> ThingCategories { get; set; }

    public virtual DbSet<Trip> Trips { get; set; }

    public virtual DbSet<TripSharedThing> TripSharedThings { get; set; }

    public virtual DbSet<TripStatus> TripStatuses { get; set; }

    public virtual DbSet<TripUser> TripUsers { get; set; }

    public virtual DbSet<TripPack> TripUserPackages { get; set; }

    public virtual DbSet<TripUserThing> TripUserThings { get; set; }

    public virtual DbSet<Unit> Units { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserPackage> UserPackages { get; set; }

    public virtual DbSet<UserThing> UserThings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("pldbgapi");

        modelBuilder.Entity<AdminsParticipant>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("admins_participants_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.AccessCodeHash).IsFixedLength();

            entity.HasOne(d => d.Admin).WithMany(p => p.AdminsParticipantAdmins).HasConstraintName("admins_participants_admin_id_fkey");

            entity.HasOne(d => d.Participant).WithMany(p => p.AdminsParticipantParticipants).HasConstraintName("admins_participants_participant_id_fkey");

            entity.HasOne(d => d.ParticipantStatus).WithMany(p => p.AdminsParticipants)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("admins_participants_participant_status_id_fkey");
        });

        modelBuilder.Entity<CommunicationType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("communication_types_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<Invitation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("invitations_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Trip).WithMany(p => p.Invitations).HasConstraintName("invitations_trip_id_fkey");
        });

        modelBuilder.Entity<ParticipantStatus>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("participant_statuses_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<ThingCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("thing_categories_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<Trip>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("trips_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.TripStatus).WithMany(p => p.Trips)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("trips_trip_status_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.Trips).HasConstraintName("trips_user_id_fkey");
        });

        modelBuilder.Entity<TripSharedThing>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("trip_shared_things_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.AssignedThing).WithMany(p => p.TripSharedThings)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("trip_shared_things_assigned_thing_id_fkey");

            entity.HasOne(d => d.AssignedTo).WithMany(p => p.TripSharedThings)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("trip_shared_things_assigned_to_id_fkey");

            entity.HasOne(d => d.Trip).WithMany(p => p.TripSharedThings).HasConstraintName("trip_shared_things_trip_id_fkey");
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

            entity.HasOne(d => d.AdminParticipant).WithMany(p => p.TripUsers).HasConstraintName("trip_users_admin_participant_id_fkey");

            entity.HasOne(d => d.Trip).WithMany(p => p.TripUsers).HasConstraintName("trip_users_trip_id_fkey");
        });

        modelBuilder.Entity<TripPack>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("trip_user_packages_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.TripUser).WithMany(p => p.TripUserPackages).HasConstraintName("trip_user_packages_trip_user_id_fkey");
        });

        modelBuilder.Entity<TripUserThing>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("trip_user_things_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.TripUser).WithMany(p => p.TripUserThings).HasConstraintName("trip_user_things_trip_user_id_fkey");

            entity.HasOne(d => d.TripPack).WithMany(p => p.TripUserThings)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("trip_user_things_trip_user_package_id_fkey");
        });

        modelBuilder.Entity<Unit>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("units_pkey");

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

            entity.HasOne(d => d.User).WithMany(p => p.UserPackages).HasConstraintName("user_packages_user_id_fkey");
        });

        modelBuilder.Entity<UserThing>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_things_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.User).WithMany(p => p.UserThings).HasConstraintName("user_things_user_id_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
