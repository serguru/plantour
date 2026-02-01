using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]

public class AiTemplateController(IAiService service) : ControllerBase
{
    private readonly IAiService _service = service;

    [HttpPost("items-by-prompt")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<AiItemDto>>> GetAllByPrompt(
        [FromBody] PackingListRequest request)
    {
        var dtos = await _service.GetAllByPromptAsync(request.Prompt);
        return Ok(dtos);
    }

    [HttpGet("latest-prompts")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<AiPromptDto>>> GetLatestPrompts()
    {
        var dtos = await _service.GetLatestPrompts();
        return Ok(dtos);
    }

    [HttpGet("items-by-prompt-id/{promptId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<AiPromptDto>>> GetAllByPromptId(Guid promptId)
    {
        var dtos = await _service.GetAllByPromptIdAsync(promptId);
        return Ok(dtos);
    }

    [HttpGet("trip/{tripId}/prompt/{promptId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<AiItemDto>>> GetAllForTrip(Guid tripId, Guid promptId)
    {
        var dtos = await _service.GetAllForTripAsync(tripId, promptId);
        return Ok(dtos);
    }

    [HttpGet("trip-shared/{tripId}/prompt/{promptId}")]
    [AdminOnly]
    public async Task<ActionResult<IEnumerable<AiItemDto>>> GetAllForTripShared(Guid tripId, Guid promptId)
    {
        var dtos = await _service.GetAllForTripSharedAsync(tripId, promptId);
        return Ok(dtos);
    }

    [HttpGet("dic/prompt/{promptId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<AiItemDto>>> GetAllForDic(Guid promptId)
    {
        var dtos = await _service.GetAllForDicAsync(promptId);
        return Ok(dtos);
    }





}
