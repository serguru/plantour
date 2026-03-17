using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_server.DTOs;
using plantour_server.Services.Interfaces;

namespace plantour_server.Controllers;

[ApiController]
[Route("public")]
public class PublicTemplatesController(IPublicTemplatesService service) : ControllerBase
{
    private readonly IPublicTemplatesService _service = service;

    [HttpGet("templates")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<PublicTemplateThingDto>>> GetTemplates()
    {
        var dtos = await _service.GetAllTemplateThingsAsync();
        return Ok(dtos);
    }

    [HttpGet("templates/{templateId:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<PublicTemplateThingDto>>> GetTemplateById(Guid templateId)
    {
        var dtos = await _service.GetTemplateThingsByTemplateIdAsync(templateId);
        return Ok(dtos);
    }

    [HttpGet("age-ranges")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<PublicAgeRangeDto>>> GetAgeRanges()
    {
        var dtos = await _service.GetAgeRangesAsync();
        return Ok(dtos);
    }

    [HttpGet("temperature-ranges")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<PublicTemperatureRangeDto>>> GetTemperatureRanges()
    {
        var dtos = await _service.GetTemperatureRangesAsync();
        return Ok(dtos);
    }

    [HttpGet("activities")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<PublicActivityDto>>> GetActivities()
    {
        var dtos = await _service.GetActivitiesAsync();
        return Ok(dtos);
    }
}
