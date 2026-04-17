namespace plantour_maintenance_server.Models;

public class PasswordHashSettings
{
    public string Secret { get; set; } = null!;
    public string Salt { get; set; } = null!;
}