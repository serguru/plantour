public class ApiErrorResponse
{
    public int StatusCode { get; set; }
    public required string Message { get; set; }
    public string? Code { get; set; } // "TOKEN_EXPIRED" или "VALIDATION_ERROR"
    public string? Instance { get; set; }
    public bool IsCustom { get; set; } = false;
}