namespace plantour_server.DTOs;

public class AiAsyncStartResponseDto
{
    public string RequestId { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
}

public class AiItemsAsyncRequest
{
    public string Prompt { get; set; } = string.Empty;
    public Guid? TripId { get; set; }
    public string TargetMode { get; set; } = "all";
}

public class AiItemsAsyncStatusResponseDto
{
    public string RequestId { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public string? ErrorMessage { get; set; }
    public List<AiItemDto> Items { get; set; } = [];
}

public class TripPlanAsyncStatusResponseDto
{
    public string RequestId { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public string? ErrorMessage { get; set; }
    public TripAiPreviewResponseDto? Result { get; set; }
}

public class TripEstimateAsyncRequest
{
    public Guid TripId { get; set; }
    public bool ReplaceExisting { get; set; }
}

public class TripEstimateAsyncStatusResponseDto
{
    public string RequestId { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public string? ErrorMessage { get; set; }
    public GenerateTripAiImprovementsResponseDto? Result { get; set; }
}
