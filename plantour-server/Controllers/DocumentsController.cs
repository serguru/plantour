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


    [HttpGet("test-pdf")]
    public IActionResult GetTestPdf()
    {
        return Ok("PDF generation endpoint is under construction.");
    }


}
