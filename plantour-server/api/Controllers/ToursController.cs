using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Plantour.Infrastructure.Dtos;
using Plantour.Services;

namespace Plantour.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ToursController : ControllerBase
{
    private readonly ITourService _tourService;

    public ToursController(ITourService tourService)
    {
        _tourService = tourService;
    }

    [HttpPost]
    public async Task<ActionResult<TourResponse>> CreateTour(
        [FromBody] CreateTourRequest request,
        CancellationToken cancellationToken)
    {
        var tour = await _tourService.CreateAsync(request, cancellationToken);
        var response = MapToResponse(tour);
        return CreatedAtAction(nameof(GetTour), new { id = response.Id }, response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TourResponse>> GetTour(Guid id, CancellationToken cancellationToken)
    {
        var tour = await _tourService.GetAsync(id, cancellationToken);
        if (tour == null)
            return NotFound();

        return Ok(MapToResponse(tour));
    }

    [HttpPost("{id:guid}/patch")]
    public async Task<ActionResult<TourResponse>> ApplyPatch(
        Guid id,
        [FromBody] ApplyTourPatchRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var tour = await _tourService.ApplyPatchAsync(id, request, cancellationToken);
            return Ok(MapToResponse(tour));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException ex)
        {
            return Conflict(new
            {
                error = "Version mismatch",
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                error = "InvalidPatch",
                message = ex.Message
            });
        }
    }

    private static TourResponse MapToResponse(Models.Tour tour)
    {
        var json = string.IsNullOrWhiteSpace(tour.TourData) ? "{}" : tour.TourData;
        var element = JsonSerializer.Deserialize<JsonElement>(json);

        return new TourResponse
        {
            Id = tour.Id,
            Name = tour.Name,
            Status = tour.Status,
            StartDate = tour.StartDate,
            EndDate = tour.EndDate,
            Version = tour.Version,
            TourData = element
        };
    }
}
