using Hangfire.Dashboard;
using System.Net.Http.Headers;
using System.Text;

public class HangfireAdminFilter : IDashboardAuthorizationFilter
{
    private readonly string _expectedUser;
    private readonly string _expectedPass;
    private readonly bool _isDevelopment;

    public HangfireAdminFilter(IWebHostEnvironment env, string user, string pass)
    {
        _isDevelopment = env.IsDevelopment();
        _expectedUser = user;
        _expectedPass = pass;
    }

    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();

        // 1. Always allow in Local Development
        if (_isDevelopment) return true;

        // 2. Enforce Basic Auth in QA/Prod
        string authHeader = httpContext.Request.Headers["Authorization"]!;
        if (string.IsNullOrEmpty(authHeader)) return false;

        try
        {
            var authHeaderValue = AuthenticationHeaderValue.Parse(authHeader);
            if (!"Basic".Equals(authHeaderValue.Scheme, StringComparison.OrdinalIgnoreCase)) return false;

            var credentials = Encoding.UTF8.GetString(Convert.FromBase64String(authHeaderValue.Parameter ?? "")).Split(':');
            if (credentials.Length != 2) return false;

            return credentials[0] == _expectedUser && credentials[1] == _expectedPass;
        }
        catch
        {
            return false;
        }
    }
}