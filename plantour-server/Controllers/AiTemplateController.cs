using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]

public class AiTemplateController(IAiService aiService) : ControllerBase
{
    private readonly IAiService _aiService = aiService;

    [HttpPost("ai-items")]
    public async Task<ActionResult<IEnumerable<AiItemDto>>> GeneratePackingList(
        [FromBody] PackingListRequest request)
    {
        var dtos = await _aiService.GenerateListAsync(request.Prompt);
        return Ok(dtos);
    }
}
