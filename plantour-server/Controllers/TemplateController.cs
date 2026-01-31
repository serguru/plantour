using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]

public class TemplateController(ITemplateService service, IAiPackingListService aiService) : ControllerBase
{
    private readonly ITemplateService _service = service;
    private readonly IAiPackingListService _aiService = aiService;

    [HttpGet]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<VTemplateThingsFullDto>>> GetAll()
    {
        var dtos = await _service.GetAllAsync();
        return Ok(dtos);
    }

    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<VTemplateThingsFullDto>>> GetAllForTrip(Guid tripId)
    {
        var dtos = await _service.GetAllForTripAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("trip-shared/{tripId}")]
    [AdminOnly]
    public async Task<ActionResult<IEnumerable<VTemplateThingsFullDto>>> GetAllForTripShared(Guid tripId)
    {
        var dtos = await _service.GetAllForTripSharedAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("dic")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<VTemplateThingsFullDto>>> GetAllForDic()
    {
        var dtos = await _service.GetAllForDicAsync();
        return Ok(dtos);
    }



    [HttpPost("ai-items")]
    public async Task<ActionResult<IEnumerable<AIItemDto>>> GeneratePackingList(
        [FromBody] PackingListRequest request)
    {
        var dtos = await _aiService.GeneratePackingListAsync(request.Prompt);
        return Ok(dtos);
    }

}
