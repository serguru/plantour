using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentsService _service;


    public DocumentsController(IDocumentsService service)
    {
        _service = service;
    }

    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<IActionResult> GetTripReportPdf(Guid tripId)
    {
        var pdfBytes = await _service.GenerateTripReportPdfAsync(tripId);
        return File(pdfBytes, "application/pdf", $"trip-report-{tripId}.pdf");
    }

    [HttpGet("trip/{tripId}/package/{packageId}/packing-list")]
    [AdminOrParticipant]
    public async Task<IActionResult> GetPackingListPdf(Guid tripId, Guid packageId)
    {
        var pdfBytes = await _service.GeneratePackingListPdfAsync(tripId, packageId);
        return File(pdfBytes, "application/pdf", $"packing-list-{packageId}.pdf");
    }

    [HttpGet("version")]
    public string GetAppVersion()
    {
        var v = Assembly.GetEntryAssembly()?.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion;
        return v != null ? v.ToString() : "No version found";
    }
}
