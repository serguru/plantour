using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

public partial class PlantourContext
{
    // This method is called at the end of the generated OnModelCreating
    partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
    {
        // Put your UTC Value Converters or specific logic here
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(
                        v => v.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(v, DateTimeKind.Utc) : v.ToUniversalTime(),
                        v => v
                    ));
                }
            }
        }
    }
}
