using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
[AdminOrParticipant]
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


}
