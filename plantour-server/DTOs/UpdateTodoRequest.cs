namespace plantour_server.DTOs;

public class UpdateTodoRequest
{
    public Guid Id { get; set; }
    public string? Category { get; set; }
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
}