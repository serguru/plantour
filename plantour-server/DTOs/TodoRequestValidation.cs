using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public static class TodoRequestValidation
{
    public static IEnumerable<ValidationResult> ValidateCoordinates(
        decimal? latitude,
        decimal? longitude,
        string latitudeMemberName,
        string longitudeMemberName)
    {
        if (latitude.HasValue != longitude.HasValue)
        {
            yield return new ValidationResult(
                "Latitude and Longitude must both be provided or both be omitted.",
                [latitudeMemberName, longitudeMemberName]);
        }

        if (latitude is < -90 or > 90)
        {
            yield return new ValidationResult(
                "Latitude must be between -90 and 90.",
                [latitudeMemberName]);
        }

        if (longitude is < -180 or > 180)
        {
            yield return new ValidationResult(
                "Longitude must be between -180 and 180.",
                [longitudeMemberName]);
        }
    }
}