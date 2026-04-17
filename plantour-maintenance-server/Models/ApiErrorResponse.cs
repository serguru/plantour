namespace plantour_maintenance_server.Models;

public class ApiErrorResponse
{
    public int StatusCode { get; set; }
    public required string Message { get; set; }
    public string? Code { get; set; }
    public string? Instance { get; set; }
    public bool IsCustom { get; set; }
}