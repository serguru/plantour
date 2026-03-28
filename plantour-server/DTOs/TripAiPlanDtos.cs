namespace plantour_server.DTOs;

public class TripAiPreviewRequest
{
    public string Question { get; set; } = string.Empty;
}

public class TripAiQuestionDto
{
    public string Question { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class TripAiPreviewResponseDto
{
    public string Question { get; set; } = string.Empty;
    public TripAiPlanDto Plan { get; set; } = new();
    public bool FromCache { get; set; }
    public bool DatesAdjusted { get; set; }
}

public class CreateTripFromAiPlanRequest
{
    public string Question { get; set; } = string.Empty;
    public Guid CurrencyId { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
}

public class TripAiCreateTripResponseDto
{
    public Guid TripId { get; set; }
    public string TripName { get; set; } = string.Empty;
    public TripAiPlanDto Plan { get; set; } = new();
    public TripAiAppliedCountsDto Applied { get; set; } = new();
}

public class ApplyTripAiPlanRequest
{
    public Guid TripId { get; set; }
    public string Prompt { get; set; } = string.Empty;
}

public class TripAiApplyResponseDto
{
    public TripAiPlanDto Plan { get; set; } = new();
    public TripAiAppliedCountsDto Applied { get; set; } = new();
}

public class TripAiAppliedCountsDto
{
    public int ItineraryPartsAdded { get; set; }
    public int PersonalActivitiesAdded { get; set; }
    public int PublicActivitiesAdded { get; set; }
    public int PersonalItemsAdded { get; set; }
    public int SharedItemsAdded { get; set; }
    public int PersonalTodosAdded { get; set; }
    public int SharedTodosAdded { get; set; }
    public int PersonalExpensesAdded { get; set; }
    public int SharedExpensesAdded { get; set; }
    public bool NotesUpdated { get; set; }
}

public class TripAiPlanDto
{
    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string GeneralRecommendations { get; set; } = string.Empty;
    public List<string> Assumptions { get; set; } = [];
    public string SuggestedStartDate { get; set; } = string.Empty;
    public string SuggestedEndDate { get; set; } = string.Empty;
    public List<TripAiItineraryPartDto> Itinerary { get; set; } = [];
    public List<TripAiThingDto> PersonalItems { get; set; } = [];
    public List<TripAiThingDto> SharedItems { get; set; } = [];
    public List<TripAiTodoDto> PersonalTodos { get; set; } = [];
    public List<TripAiTodoDto> SharedTodos { get; set; } = [];
    public List<TripAiExpenseDto> PersonalExpenses { get; set; } = [];
    public List<TripAiExpenseDto> SharedExpenses { get; set; } = [];
}

public class TripAiItineraryPartDto
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public List<TripAiActivityDto> PublicActivities { get; set; } = [];
    public List<TripAiActivityDto> PersonalActivities { get; set; } = [];
}

public class TripAiActivityDto
{
    public string Activity { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}

public class TripAiThingDto
{
    public string Category { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Units { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class TripAiTodoDto
{
    public string Category { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}

public class TripAiExpenseDto
{
    public string Category { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Notes { get; set; } = string.Empty;
}