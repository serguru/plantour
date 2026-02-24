namespace plantour_server.Models;

public class AccessRule
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
    public bool Granted { get; set; } = false;
    public int? Value { get; set; }
}