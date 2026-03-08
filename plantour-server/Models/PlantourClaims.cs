using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace plantour_server.Models;

public static class PlantourClaims
{
    public const string UserId = "user_id";
    public const string Email = "email";
    public const string FirstName = "first_name";
    public const string LastName = "last_name";
    public const string Phone = "phone";
    public const string Role = "role";
    public const string PlanPeriod = "plan_period";
    public const string BillingPeriodStart = "billing_period_start";
    public const string BillingPeriodEnd = "billing_period_end";

    public const string AdminId = "admin_id";
    public const string AccessRules = "access_rules";
    public const string Subject = JwtRegisteredClaimNames.Sub;
    public const string Issuer = JwtRegisteredClaimNames.Iss;
    public const string Audience = JwtRegisteredClaimNames.Aud;
    public const string PaddleSubscriptionId = "paddle_subscription_id";
    public const string PaddleCustomerId = "paddle_customer_id";
    public const string Temporary = "temporary";
    
}

public static class PlantourRoles
{
    public const string Admin = "Admin";
    public const string Participant = "Participant";
}