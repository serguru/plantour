using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public static class TodoRequestValidation
{
    public static IEnumerable<ValidationResult> Validate(DateTime? startDate, DateTime? endDate, decimal? latitude, decimal? longitude)
    {
        if (startDate.HasValue != endDate.HasValue)
        {
            yield return new ValidationResult(
                "StartDate and EndDate must both be provided or both be omitted.",
                [nameof(CreateTodoRequest.StartDate), nameof(CreateTodoRequest.EndDate)]);
        }

        if (startDate.HasValue && endDate.HasValue && startDate.Value > endDate.Value)
        {
            yield return new ValidationResult(
                "StartDate cannot be later than EndDate.",
                [nameof(CreateTodoRequest.StartDate), nameof(CreateTodoRequest.EndDate)]);
        }

        if (latitude.HasValue != longitude.HasValue)
        {
            yield return new ValidationResult(
                "Latitude and Longitude must both be provided or both be omitted.",
                [nameof(CreateTodoRequest.Latitude), nameof(CreateTodoRequest.Longitude)]);
        }

        if (latitude is < -90 or > 90)
        {
            yield return new ValidationResult(
                "Latitude must be between -90 and 90.",
                [nameof(CreateTodoRequest.Latitude)]);
        }

        if (longitude is < -180 or > 180)
        {
            yield return new ValidationResult(
                "Longitude must be between -180 and 180.",
                [nameof(CreateTodoRequest.Longitude)]);
        }
    }
}