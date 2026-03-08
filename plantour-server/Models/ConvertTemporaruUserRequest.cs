namespace plantour_server.Models;

public class ConvertTemporaryUserRequest
{
    public string OldEmail { get; set; } = null!;
    public string NewEmail { get; set; } = null!;
}