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

    // public bool Authorize(DashboardContext context)
    // {
    //     return true;
    //     var httpContext = context.GetHttpContext();

    //     // 1. Always allow in Local Development
    //     if (_isDevelopment) return true;

    //     // 2. Enforce Basic Auth in QA/Prod
    //     string authHeader = httpContext.Request.Headers["Authorization"]!;
    //     if (string.IsNullOrEmpty(authHeader)) return false;

    //     try
    //     {
    //         var authHeaderValue = AuthenticationHeaderValue.Parse(authHeader);
    //         if (!"Basic".Equals(authHeaderValue.Scheme, StringComparison.OrdinalIgnoreCase)) return false;

    //         var credentials = Encoding.UTF8.GetString(Convert.FromBase64String(authHeaderValue.Parameter ?? "")).Split(':');
    //         if (credentials.Length != 2) return false;

    //         return credentials[0] == _expectedUser && credentials[1] == _expectedPass;
    //     }
    //     catch
    //     {
    //         return false;
    //     }
    // }

    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();

        if (_isDevelopment) return true;

        // 1. Get header safely
        string? authHeader = httpContext.Request.Headers["Authorization"];

        if (!string.IsNullOrWhiteSpace(authHeader))
        {
            try
            {
                var authHeaderValue = AuthenticationHeaderValue.Parse(authHeader);

                if ("Basic".Equals(authHeaderValue.Scheme, StringComparison.OrdinalIgnoreCase))
                {
                    // authHeaderValue.Parameter can also be null, so we use ?? ""
                    var parameter = authHeaderValue.Parameter ?? "";
                    var credentials = Encoding.UTF8.GetString(Convert.FromBase64String(parameter)).Split(':');

                    if (credentials.Length == 2 &&
                        credentials[0] == _expectedUser &&
                        credentials[1] == _expectedPass)
                    {
                        return true;
                    }
                }
            }
            catch
            {
                // If parsing fails, we'll just fall through to the challenge
            }
        }

        // 2. Failure: Send the 401 Challenge to the browser
        httpContext.Response.StatusCode = 401;
        httpContext.Response.Headers["WWW-Authenticate"] = "Basic realm=\"Hangfire Dashboard\"";
        return false;
    }
}