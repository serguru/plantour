namespace plantour_server.DTOs;

public class CreateTodoRequest
{
    public string? Category { get; set; }
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
}