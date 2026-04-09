using System.Globalization;
using System.Text;
using System.Text.Json;
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
    private static readonly JsonSerializerOptions HelpJsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private static readonly SitemapEntry[] StaticEntries =
    [
        new("/", 1.0m),
        new("/packing-list-generator/templates", 0.9m),
        new("/contact", 0.6m),
        new("/privacy", 0.3m),
        new("/terms", 0.3m)
    ];

    [AllowAnonymous]
    [HttpGet("/sitemap.xml")]
    public async Task<IActionResult> GetSitemap()
    {
        if (!environment.IsProduction())
        {
            return NotFound();
        }

        var urls = await GetSitemapEntriesAsync();

        var requestBase = GetRequestBaseUri();

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

                if (entry.LastModified is not null)
                {
                    await writer.WriteElementStringAsync(
                        null,
                        "lastmod",
                        SitemapNamespace,
                        entry.LastModified.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
                }

                if (entry.Priority is not null)
                {
                    await writer.WriteElementStringAsync(
                        null,
                        "priority",
                        SitemapNamespace,
                        Math.Clamp(entry.Priority.Value, 0m, 1m).ToString("0.0", CultureInfo.InvariantCulture));
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

    [AllowAnonymous]
    [HttpGet("/robots.txt")]
    public IActionResult GetRobots()
    {
        var requestBase = GetRequestBaseUri();

        List<string> lines = environment.IsProduction() ?
            [
                "User-agent: *",
                "Allow: /",
                "Disallow: /sign-in",
                "Disallow: /sign-in/participant",
                "Disallow: /signin-token",
                "Disallow: /search",
                $"Sitemap: {ToAbsoluteUrl(requestBase, "/sitemap.xml")}"
            ]
            :
            [
                "User-agent: *",
                "Disallow: /"
            ];

        var payload = string.Join('\n', lines) + '\n';
        return Content(payload, "text/plain; charset=utf-8");
    }

    private async Task<List<SitemapEntry>> GetSitemapEntriesAsync()
    {
        var helpEntries = await GetHelpSitemapEntriesAsync();

        var publicTemplateEntries = await context.VTemplateThingsFulls
            .AsNoTracking()
            .Where(x => x.TemplateId != null && !string.IsNullOrWhiteSpace(x.TemplateName))
            .GroupBy(x => new { TemplateId = x.TemplateId!.Value, TemplateName = x.TemplateName! })
            .Select(group => new SitemapEntry(
                $"/packing-list-generator/templates/{Slugify(group.Key.TemplateName)}~{group.Key.TemplateId}",
                0.7m,
                null))
            .ToListAsync();

        return StaticEntries
            .Concat(helpEntries)
            .Concat(publicTemplateEntries)
            .GroupBy(entry => entry.Url, StringComparer.OrdinalIgnoreCase)
            .Select(group => group.First())
            .OrderBy(entry => entry.Url, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private async Task<List<SitemapEntry>> GetHelpSitemapEntriesAsync()
    {
        var helpSectionsRootPath = ResolveHelpSectionsRootPath();
        var sectionOrderPath = ResolveHelpSectionOrderPath();
        if (helpSectionsRootPath is null || sectionOrderPath is null)
        {
            return [new("/help", 0.8m)];
        }

        string[] sectionFolders;

        try
        {
            sectionFolders = await ReadHelpSectionOrderAsync(sectionOrderPath);
        }
        catch (IOException)
        {
            return [new("/help", 0.8m)];
        }
        catch (JsonException)
        {
            return [new("/help", 0.8m)];
        }

        var lastModified = System.IO.File.GetLastWriteTimeUtc(sectionOrderPath);
        var entries = new List<SitemapEntry> { new("/help", 0.8m, lastModified) };

        foreach (var sectionFolder in sectionFolders)
        {
            var sectionManifestPath = Path.Combine(helpSectionsRootPath, sectionFolder, "section.json");
            if (!System.IO.File.Exists(sectionManifestPath))
            {
                continue;
            }

            HelpSectionManifest? manifest;
            try
            {
                manifest = await ReadHelpSectionManifestAsync(sectionManifestPath);
            }
            catch (IOException)
            {
                continue;
            }
            catch (JsonException)
            {
                continue;
            }

            if (manifest is null || string.IsNullOrWhiteSpace(manifest.Id) || manifest.Questions is null)
            {
                continue;
            }

            lastModified = Max(lastModified, System.IO.File.GetLastWriteTimeUtc(sectionManifestPath));

            foreach (var questionFileName in manifest.Questions)
            {
                if (string.IsNullOrWhiteSpace(questionFileName))
                {
                    continue;
                }

                var questionPath = Path.Combine(helpSectionsRootPath, sectionFolder, questionFileName);
                if (!System.IO.File.Exists(questionPath))
                {
                    continue;
                }

                HelpQuestionSource? question;
                try
                {
                    question = await ReadHelpQuestionSourceAsync(questionPath);
                }
                catch (IOException)
                {
                    continue;
                }
                catch (JsonException)
                {
                    continue;
                }

                if (question is null || string.IsNullOrWhiteSpace(question.Slug))
                {
                    continue;
                }

                var questionLastModified = System.IO.File.GetLastWriteTimeUtc(questionPath);
                lastModified = Max(lastModified, questionLastModified);
                entries.Add(new($"/help/{manifest.Id}/{question.Slug}", 0.5m, questionLastModified));
            }
        }

        entries[0] = entries[0] with { LastModified = lastModified };

        return entries;
    }

    private async Task<string[]> ReadHelpSectionOrderAsync(string sectionOrderPath)
    {
        await using var stream = System.IO.File.OpenRead(sectionOrderPath);
        var sectionFolders = await JsonSerializer.DeserializeAsync<string[]>(stream, HelpJsonOptions);
        return sectionFolders ?? [];
    }

    private async Task<HelpSectionManifest?> ReadHelpSectionManifestAsync(string sectionManifestPath)
    {
        await using var stream = System.IO.File.OpenRead(sectionManifestPath);
        return await JsonSerializer.DeserializeAsync<HelpSectionManifest>(stream, HelpJsonOptions);
    }

    private async Task<HelpQuestionSource?> ReadHelpQuestionSourceAsync(string questionPath)
    {
        await using var stream = System.IO.File.OpenRead(questionPath);
        return await JsonSerializer.DeserializeAsync<HelpQuestionSource>(stream, HelpJsonOptions);
    }

    private string? ResolveHelpSectionsRootPath()
    {
        var sectionsRootPath = Path.GetFullPath(Path.Combine(
            environment.ContentRootPath,
            "..",
            "plantour-client",
            "src",
            "app",
            "components",
            "help",
            "sections"));

        return Directory.Exists(sectionsRootPath) ? sectionsRootPath : null;
    }

    private string? ResolveHelpSectionOrderPath()
    {
        var sectionOrderPath = Path.GetFullPath(Path.Combine(
            environment.ContentRootPath,
            "..",
            "plantour-client",
            "src",
            "app",
            "components",
            "help",
            "sections",
            "sections-order.json"));

        return System.IO.File.Exists(sectionOrderPath) ? sectionOrderPath : null;
    }

    private static DateTime Max(DateTime left, DateTime right)
    {
        return left >= right ? left : right;
    }

    private Uri GetRequestBaseUri()
    {
        var scheme = Request.Scheme;
        if (environment.IsProduction() && !string.Equals(scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase))
        {
            scheme = Uri.UriSchemeHttps;
        }

        var host = Request.Host.Value;
        if (string.IsNullOrWhiteSpace(host))
        {
            throw new InvalidOperationException("Request host is missing.");
        }

        return new Uri($"{scheme}://{host}");
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

    private static string Slugify(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var builder = new StringBuilder(value.Length);
        var previousWasSeparator = false;

        foreach (var ch in value.ToLowerInvariant())
        {
            if ((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9'))
            {
                builder.Append(ch);
                previousWasSeparator = false;
                continue;
            }

            if (previousWasSeparator || builder.Length == 0)
            {
                continue;
            }

            builder.Append('-');
            previousWasSeparator = true;
        }

        var slug = builder.ToString().Trim('-');
        return slug.Length <= 60 ? slug : slug[..60].TrimEnd('-');
    }

    private sealed record HelpSectionManifest(string Id, string[] Questions);

    private sealed record HelpQuestionSource(string Slug);

    private sealed record SitemapEntry(string Url, decimal? Priority, DateTime? LastModified = null);
}
