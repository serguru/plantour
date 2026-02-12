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

    public virtual DbSet<AccessType> AccessTypes { get; set; }

    public virtual DbSet<Activity> Activities { get; set; }

    public virtual DbSet<AdminsParticipant> AdminsParticipants { get; set; }

    public virtual DbSet<AgeRange> AgeRanges { get; set; }

    public virtual DbSet<AiPrompt> AiPrompts { get; set; }

    public virtual DbSet<AiThing> AiThings { get; set; }

    public virtual DbSet<ApiVisit> ApiVisits { get; set; }

    public virtual DbSet<CommunicationType> CommunicationTypes { get; set; }

    public virtual DbSet<ContactSubmission> ContactSubmissions { get; set; }

    public virtual DbSet<ErrorLog> ErrorLogs { get; set; }

    public virtual DbSet<Gender> Genders { get; set; }

    public virtual DbSet<Invitation> Invitations { get; set; }

    public virtual DbSet<Log> Logs { get; set; }

    public virtual DbSet<Plan> Plans { get; set; }

    public virtual DbSet<RecentLog> RecentLogs { get; set; }

    public virtual DbSet<Setting> Settings { get; set; }

    public virtual DbSet<SitemapUrl> SitemapUrls { get; set; }

    public virtual DbSet<TemperatureRange> TemperatureRanges { get; set; }

    public virtual DbSet<TemplateThing> TemplateThings { get; set; }

    public virtual DbSet<ThingCategory> ThingCategories { get; set; }

    public virtual DbSet<ThingTemplate> ThingTemplates { get; set; }

    public virtual DbSet<Transaction> Transactions { get; set; }

    public virtual DbSet<TransactionType> TransactionTypes { get; set; }

    public virtual DbSet<Trip> Trips { get; set; }

    public virtual DbSet<TripComment> TripComments { get; set; }

    public virtual DbSet<TripSharedThing> TripSharedThings { get; set; }

    public virtual DbSet<TripStatus> TripStatuses { get; set; }

    public virtual DbSet<TripUser> TripUsers { get; set; }

    public virtual DbSet<TripUserPackage> TripUserPackages { get; set; }

    public virtual DbSet<TripUserThing> TripUserThings { get; set; }

    public virtual DbSet<Unit> Units { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserEmailConfirmation> UserEmailConfirmations { get; set; }

    public virtual DbSet<UserPackage> UserPackages { get; set; }

    public virtual DbSet<UserRefreshToken> UserRefreshTokens { get; set; }

    public virtual DbSet<UserThing> UserThings { get; set; }

    public virtual DbSet<VTemplateThingsFull> VTemplateThingsFulls { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("pldbgapi");

        modelBuilder.Entity<AccessType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("access_types_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<Activity>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("activities_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<AdminsParticipant>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("admins_participants_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.AccessCodeHash).IsFixedLength();

            entity.HasOne(d => d.Admin).WithMany(p => p.AdminsParticipantAdmins).HasConstraintName("admins_participants_admin_id_fkey");

            entity.HasOne(d => d.Participant).WithMany(p => p.AdminsParticipantParticipants).HasConstraintName("admins_participants_participant_id_fkey");
        });

        modelBuilder.Entity<AgeRange>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("age_ranges_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<AiPrompt>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ai_prompts_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(now() AT TIME ZONE 'utc'::text)");

            entity.HasOne(d => d.User).WithMany(p => p.AiPrompts).HasConstraintName("ai_prompts_user_id_fkey");
        });

        modelBuilder.Entity<AiThing>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ai_things_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.Prompt).WithMany(p => p.AiThings).HasConstraintName("ai_things_prompt_id_fkey");
        });

        modelBuilder.Entity<ApiVisit>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("api_visits_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(now() AT TIME ZONE 'utc'::text)");
        });

        modelBuilder.Entity<CommunicationType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("communication_types_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<ContactSubmission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("contact_submissions_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(now() AT TIME ZONE 'utc'::text)");
        });

        modelBuilder.Entity<ErrorLog>(entity =>
        {
            entity.ToView("error_logs", "plantour");
        });

        modelBuilder.Entity<Gender>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("genders_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<Invitation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("invitations_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(now() AT TIME ZONE 'utc'::text)");

            entity.HasOne(d => d.AdminParticipant).WithMany(p => p.Invitations).HasConstraintName("invitations_admin_participant_id_fkey");
        });

        modelBuilder.Entity<Log>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("logs_pkey");

            entity.ToTable("logs", "plantour", tb => tb.HasComment("stores application log events from serilog framework"));

            entity.Property(e => e.Id).HasComment("auto-incrementing primary key");
            entity.Property(e => e.Exception).HasComment("exception details if applicable");
            entity.Property(e => e.Level).HasComment("log level: verbose, debug, information, warning, error, fatal");
            entity.Property(e => e.LogEvent).HasComment("complete log event as json");
            entity.Property(e => e.MessageTemplate).HasComment("the log message template with placeholders");
            entity.Property(e => e.Properties).HasComment("additional structured properties as json (enrichers, context data)");
            entity.Property(e => e.TimeStamp)
                .HasDefaultValueSql("(now() AT TIME ZONE 'utc'::text)")
                .HasComment("timestamp when the log event was recorded");
        });

        modelBuilder.Entity<Plan>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("plans_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<RecentLog>(entity =>
        {
            entity.ToView("recent_logs", "plantour");
        });

        modelBuilder.Entity<Setting>(entity =>
        {
            entity.HasKey(e => e.Key).HasName("settings_pkey");

            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(now() AT TIME ZONE 'utc'::text)");
            entity.Property(e => e.ValueType).HasDefaultValueSql("'string'::text");
        });

        modelBuilder.Entity<SitemapUrl>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("sitemap_urls_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(now() AT TIME ZONE 'utc'::text)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.LastModified).HasDefaultValueSql("(now() AT TIME ZONE 'utc'::text)");
            entity.Property(e => e.Priority).HasDefaultValue(50);
        });

        modelBuilder.Entity<TemperatureRange>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("temperature_ranges_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<TemplateThing>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("template_things_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.Template).WithMany(p => p.TemplateThings).HasConstraintName("template_things_template_id_fkey");
        });

        modelBuilder.Entity<ThingCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("thing_categories_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<ThingTemplate>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("thing_templates_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.Activity).WithMany(p => p.ThingTemplates).HasConstraintName("thing_templates_activity_id_fkey");

            entity.HasOne(d => d.AgeRanges).WithMany(p => p.ThingTemplates)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("thing_templates_age_ranges_id_fkey");

            entity.HasOne(d => d.TemperatureRanges).WithMany(p => p.ThingTemplates)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("thing_templates_temperature_ranges_id_fkey");
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("transactions_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(now() AT TIME ZONE 'utc'::text)");

            entity.HasOne(d => d.TransactionType).WithMany(p => p.Transactions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("transactions_transaction_type_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.Transactions).HasConstraintName("transactions_user_id_fkey");
        });

        modelBuilder.Entity<TransactionType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("transaction_types_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<Trip>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("trips_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(now() AT TIME ZONE 'utc'::text)");

            entity.HasOne(d => d.TripStatus).WithMany(p => p.Trips)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("trips_trip_status_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.Trips).HasConstraintName("trips_user_id_fkey");
        });

        modelBuilder.Entity<TripComment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("trip_comments_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.Trip).WithMany(p => p.TripComments).HasConstraintName("trip_comments_trip_id_fkey");

            entity.HasOne(d => d.TripUser).WithMany(p => p.TripComments)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("trip_comments_trip_user_id_fkey");
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

        modelBuilder.Entity<TripUserPackage>(entity =>
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

            entity.HasOne(d => d.TripUserPackage).WithMany(p => p.TripUserThings)
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
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(now() AT TIME ZONE 'utc'::text)");

            entity.HasOne(d => d.AccessType).WithMany(p => p.Users)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("users_access_type_id_fkey");

            entity.HasOne(d => d.Plan).WithMany(p => p.Users)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("users_plan_id_fkey");
        });

        modelBuilder.Entity<UserEmailConfirmation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_email_confirmations_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(now() AT TIME ZONE 'utc'::text)");

            entity.HasOne(d => d.User).WithOne(p => p.UserEmailConfirmation).HasConstraintName("user_email_confirmations_user_id_fkey");
        });

        modelBuilder.Entity<UserPackage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_packages_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.User).WithMany(p => p.UserPackages).HasConstraintName("user_packages_user_id_fkey");
        });

        modelBuilder.Entity<UserRefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_refresh_tokens_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(now() AT TIME ZONE 'utc'::text)");

            entity.HasOne(d => d.User).WithMany(p => p.UserRefreshTokens).HasConstraintName("user_refresh_tokens_user_id_fkey");
        });

        modelBuilder.Entity<UserThing>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_things_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.User).WithMany(p => p.UserThings).HasConstraintName("user_things_user_id_fkey");
        });

        modelBuilder.Entity<VTemplateThingsFull>(entity =>
        {
            entity.ToView("v_template_things_full", "plantour");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
