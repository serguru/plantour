using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]

public class AiTemplateController(IAiPackingListService aiService) : ControllerBase
{
    private readonly IAiPackingListService _aiService = aiService;

    [HttpPost("ai-items")]
    public async Task<ActionResult<IEnumerable<AIItemDto>>> GeneratePackingList(
        [FromBody] PackingListRequest request)
    {
        var dtos = await _aiService.GeneratePackingListAsync(request.Prompt);
        return Ok(dtos);
    }
}
