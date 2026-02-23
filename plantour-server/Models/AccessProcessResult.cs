using plantour_server.DbModels;
using plantour_server.Utils;

namespace plantour_server.Models;

public class AccessProcessResult
{
    public AccessRules AccessRulesObject { get; set; } = null!;
    public User UserObject { get; set; } = null!;
}
