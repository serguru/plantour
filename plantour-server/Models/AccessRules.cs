namespace plantour_server.Models;



/// <summary>
/// Represents an access rule that can be assigned to a user or a plan. Access rules define specific permissions or restrictions for users, such as access to certain features, content, or actions within the application. Each access rule has a name, a granted status indicating whether the permission is granted or denied, and optional notes for additional information. The value field can be used to store any relevant data associated with the access rule, such as specific feature names or identifiers.
/// </summary>

public class AccessRule
{
    /// <summary>
    /// Unique identifier for the access rule. This can be used to reference the rule in the database or in code when assigning it to users or plans.
    /// </summary>
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
    public bool Granted { get; set; }
    public int? Value { get; set; }
}