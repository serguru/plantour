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

    [HttpPost("items/start")]
    [AdminOrParticipant]
    public async Task<ActionResult<AiAsyncStartResponseDto>> StartItemsRequest([FromBody] AiItemsAsyncRequest request)
    {
        var dto = await _service.StartItemsRequestAsync(request);
        return Ok(dto);
    }

    [HttpPost("items/status")]
    [AdminOrParticipant]
    public async Task<ActionResult<AiItemsAsyncStatusResponseDto>> GetItemsRequestStatus([FromBody] AiItemsAsyncRequest request)
    {
        var dto = await _service.GetItemsRequestStatusAsync(request);
        return Ok(dto);
    }

    [HttpGet("latest-prompts")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<AiPromptDto>>> GetLatestPrompts()
    {
        var dtos = await _service.GetLatestPrompts();
        return Ok(dtos);
    }

    [HttpGet("trip-plan/latest-questions")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripAiQuestionDto>>> GetLatestTripPlanQuestions()
    {
        var dtos = await _service.GetLatestTripPlanQuestionsAsync();
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

    [HttpPost("trip-plan/apply")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripAiApplyResponseDto>> ApplyTripPlan([FromBody] ApplyTripAiPlanRequest request)
    {
        var dto = await _service.ApplyTripPlanAsync(request.TripId, request.Prompt);
        return Ok(dto);
    }

    [HttpPost("trip-plan/preview")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripAiPreviewResponseDto>> GetTripPlanPreview([FromBody] TripAiPreviewRequest request)
    {
        var dto = await _service.GetTripPlanPreviewAsync(request.Question, request.CurrencyText);
        return Ok(dto);
    }

    [HttpPost("trip-plan/preview/start")]
    [AdminOrParticipant]
    public async Task<ActionResult<AiAsyncStartResponseDto>> StartTripPlanPreview([FromBody] TripAiPreviewRequest request)
    {
        var dto = await _service.StartTripPlanPreviewRequestAsync(request);
        return Ok(dto);
    }

    [HttpPost("trip-plan/preview/status")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripPlanAsyncStatusResponseDto>> GetTripPlanPreviewStatus([FromBody] TripAiPreviewRequest request)
    {
        var dto = await _service.GetTripPlanPreviewStatusAsync(request);
        return Ok(dto);
    }

    [HttpPost("trip-plan/create")]
    [AdminOnly]
    public async Task<ActionResult<TripAiCreateTripResponseDto>> CreateTripFromPlan([FromBody] CreateTripFromAiPlanRequest request)
    {
        var dto = await _service.CreateTripFromPlanAsync(request);
        return Ok(dto);
    }

    [HttpPost("trip-improvements/generate")]
    [AdminOrParticipant]
    public async Task<ActionResult<GenerateTripAiImprovementsResponseDto>> GenerateTripImprovements([FromBody] GenerateTripAiImprovementsRequest request)
    {
        var dto = await _service.GenerateTripAiImprovementsAsync(request);
        return Ok(dto);
    }

    [HttpPost("trip-estimate/start")]
    [AdminOrParticipant]
    public async Task<ActionResult<AiAsyncStartResponseDto>> StartTripEstimate([FromBody] TripEstimateAsyncRequest request)
    {
        var dto = await _service.StartTripEstimateRequestAsync(request);
        return Ok(dto);
    }

    [HttpPost("trip-estimate/status")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripEstimateAsyncStatusResponseDto>> GetTripEstimateStatus([FromBody] TripEstimateAsyncRequest request)
    {
        var dto = await _service.GetTripEstimateStatusAsync(request);
        return Ok(dto);
    }

}
