using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("[controller]")]

public class TemplateAiController(IAiService service) : ControllerBase
{
    private readonly IAiService _service = service;

    [HttpGet("latest-prompts")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<AiPromptDto>>> GetLatestPrompts()
    {
        var dtos = await _service.GetLatestPrompts();
        return Ok(dtos);
    }

    [HttpPost("items-by-prompt")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<AiItemDto>>> GetAllByPrompt(
        [FromBody] AiItemsRequest request)
    {
        var dtos = await _service.GetAllByPromptAsync(request.Prompt);
        return Ok(dtos);
    }


    [HttpPost("trip/prompt")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<AiItemDto>>> GetAllForTrip([FromBody] AiItemsRequest request)
    {
        var dtos = await _service.GetAllForTripAsync(request.TripId!.Value, request.Prompt);
        return Ok(dtos);
    }

    [HttpPost("trip-shared/prompt")]
    [AdminOnly]
    public async Task<ActionResult<IEnumerable<AiItemDto>>> GetAllForTripShared([FromBody] AiItemsRequest request)
    {
        var dtos = await _service.GetAllForTripSharedAsync(request.TripId!.Value, request.Prompt);
        return Ok(dtos);
    }

    [HttpPost("dic/prompt")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<AiItemDto>>> GetAllForDic([FromBody] AiItemsRequest request)
    {
        var dtos = await _service.GetAllForDicAsync(request.Prompt);
        return Ok(dtos);
    }





}
