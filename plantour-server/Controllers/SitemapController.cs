using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace plantour_server.Controllers;

[ApiExplorerSettings(IgnoreApi = true)]
public class SitemapController(IWebHostEnvironment environment) : ControllerBase
{
    private const string CanonicalSitemapUrl = "https://plantour.app/sitemap.xml";

    [AllowAnonymous]
    [HttpGet("/robots.txt")]
    public IActionResult GetRobots()
    {
        List<string> lines = environment.IsProduction() ?
            [
                "User-agent: *",
                "Allow: /",
                "Disallow: /sign-in",
                "Disallow: /sign-in/participant",
                "Disallow: /signin-token",
                "Disallow: /search",
                $"Sitemap: {CanonicalSitemapUrl}"
            ]
            :
            [
                "User-agent: *",
                "Disallow: /"
            ];

        var payload = string.Join('\n', lines) + '\n';
        return Content(payload, "text/plain; charset=utf-8");
    }
}
