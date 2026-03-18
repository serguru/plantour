using System.Globalization;
using System.Text;
using System.Xml;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Controllers;

[ApiExplorerSettings(IgnoreApi = true)]
public class SitemapController(PlantourContext context, IWebHostEnvironment environment) : ControllerBase
{
    private const string SitemapNamespace = "http://www.sitemaps.org/schemas/sitemap/0.9";

    [AllowAnonymous]
    [HttpGet("/sitemap.xml")]
    public async Task<IActionResult> GetSitemap()
    {
        if (!environment.IsProduction())
        {
            return NotFound();
        }

        var urls = await context.SitemapUrls
            .AsNoTracking()
            .Where(x => (x.IsActive ?? false) && !string.IsNullOrWhiteSpace(x.Url))
            .OrderBy(x => x.Url)
            .ToListAsync();

        var requestBase = new Uri($"{Request.Scheme}://{Request.Host}");

        var settings = new XmlWriterSettings
        {
            Encoding = new UTF8Encoding(encoderShouldEmitUTF8Identifier: false),
            Indent = true,
            IndentChars = "  ",
            OmitXmlDeclaration = false,
            NewLineHandling = NewLineHandling.Replace,
            Async = true
        };

        await using var stream = new MemoryStream();
        await using (var writer = XmlWriter.Create(stream, settings))
        {
            await writer.WriteStartDocumentAsync();
            await writer.WriteStartElementAsync(null, "urlset", SitemapNamespace);

            foreach (var entry in urls)
            {
                var loc = ToAbsoluteUrl(requestBase, entry.Url);

                await writer.WriteStartElementAsync(null, "url", SitemapNamespace);

                await writer.WriteElementStringAsync(null, "loc", SitemapNamespace, loc);

                // Use date-only format to avoid timezone ambiguity for "timestamp without time zone".
                await writer.WriteElementStringAsync(
                    null,
                    "lastmod",
                    SitemapNamespace,
                    entry.LastModified.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));

                if (entry.Priority is not null)
                {
                    var normalized = Math.Clamp(entry.Priority.Value, 0, 100) / 100.0;
                    await writer.WriteElementStringAsync(
                        null,
                        "priority",
                        SitemapNamespace,
                        normalized.ToString("0.0", CultureInfo.InvariantCulture));
                }

                await writer.WriteEndElementAsync(); // url
            }

            await writer.WriteEndElementAsync(); // urlset
            await writer.WriteEndDocumentAsync();
            await writer.FlushAsync();
        }

        var xmlBytes = stream.ToArray();
        return File(xmlBytes, "application/xml; charset=utf-8");
    }

    private static string ToAbsoluteUrl(Uri requestBase, string url)
    {
        if (Uri.TryCreate(url, UriKind.Absolute, out var absolute))
        {
            return absolute.ToString();
        }

        var relative = url.StartsWith('/') ? url : "/" + url;
        return new Uri(requestBase, relative).ToString();
    }
}
