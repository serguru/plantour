using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

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
                if (property.ClrType == typeof(DateTime))
                {
                    property.SetValueConverter(new ValueConverter<DateTime, DateTime>(
                        v => NormalizeDateTimeToUtc(v),
                        v => NormalizeDateTimeToUtc(v)
                    ));
                }

                if (property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(new ValueConverter<DateTime?, DateTime?>(
                        v => v.HasValue ? NormalizeDateTimeToUtc(v.Value) : v,
                        v => v.HasValue ? NormalizeDateTimeToUtc(v.Value) : v
                    ));
                }
            }
        }
    }

    private static DateTime NormalizeDateTimeToUtc(DateTime value)
    {
        return value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
        };
    }
}
