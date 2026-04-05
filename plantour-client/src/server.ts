import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { environment } from './environments/environment';
import { HELP_SITEMAP_PAGES, getHelpPageUrl } from './app/components/help/help-content';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const RENDER_HEALTH_CHECK_PATH = '/health';
const RENDER_HEALTH_CHECK_BODY = 'OK';

const app = express();
const _allowedHosts = ['localhost', '127.0.0.1', '::1', '*.code.run'];
try {
  const envHostname = new URL(environment.clientUrl).hostname;
  if (envHostname) _allowedHosts.push(envHostname);
} catch { /* clientUrl is empty or invalid (e.g. production placeholder) */ }
const angularAppEngine = new AngularNodeAppEngine({ allowedHosts: _allowedHosts });

type SitemapChangeFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface SitemapEntry {
  url: string;
  changefreq: SitemapChangeFrequency;
  priority: number;
  lastmod: string;
}

function isAuthPage(path: string): boolean {
  const normalizedPath = (path || '/').replace(/\/+$/, '') || '/';
  return normalizedPath === '/sign-in'
    || normalizedPath.startsWith('/sign-in/')
    || normalizedPath === '/signin-token';
}

function resolveBaseUrl(req?: express.Request): string {
  const forwardedProtoHeader = req?.headers['x-forwarded-proto'];
  const forwardedHostHeader = req?.headers['x-forwarded-host'];
  const forwardedProto = Array.isArray(forwardedProtoHeader) ? forwardedProtoHeader[0] : forwardedProtoHeader;
  const forwardedHost = Array.isArray(forwardedHostHeader) ? forwardedHostHeader[0] : forwardedHostHeader;

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  if (req?.protocol && req.get('host')) {
    return `${req.protocol}://${req.get('host')}`;
  }

  return environment.clientUrl.replace(/\/+$/, '');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSitemapEntries(baseUrl: string): SitemapEntry[] {
  const lastmod = new Date().toISOString().split('T')[0];
  const staticEntries: SitemapEntry[] = [
    {
      url: `${baseUrl}/`,
      changefreq: 'weekly',
      priority: 1,
      lastmod,
    },
    {
      url: `${baseUrl}/contact`,
      changefreq: 'yearly',
      priority: 0.4,
      lastmod,
    },
    {
      url: `${baseUrl}/privacy`,
      changefreq: 'yearly',
      priority: 0.3,
      lastmod,
    },
    {
      url: `${baseUrl}/terms`,
      changefreq: 'yearly',
      priority: 0.3,
      lastmod,
    },
    {
      url: `${baseUrl}/packing-list-generator/templates`,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod,
    }
  ];

  const helpEntries = HELP_SITEMAP_PAGES.map((page) => ({
    url: `${baseUrl}${getHelpPageUrl(page)}`,
    changefreq: page.kind === 'answer' ? 'monthly' : 'weekly',
    priority: page.kind === 'home' ? 0.9 : 0.7,
    lastmod,
  } satisfies SitemapEntry));

  return [...staticEntries, ...helpEntries];
}

function buildSitemapXml(entries: SitemapEntry[]): string {
  const urlset = entries.map((entry) => `  <url>\n    <loc>${escapeXml(entry.url)}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority.toFixed(1)}</priority>\n  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>`;
}

app.use((req, res, next) => {
  if (environment.environment !== 'production' || isAuthPage(req.path)) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  }

  next();
});

// Render sends GET requests to the configured health-check path and expects a fast 2xx/3xx response.
app.get(RENDER_HEALTH_CHECK_PATH, (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(200).send(RENDER_HEALTH_CHECK_BODY);
});

app.head(RENDER_HEALTH_CHECK_PATH, (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(200).end();
});

// 1. Serve static files
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.get('/sitemap.xml', (req, res) => {
  const baseUrl = resolveBaseUrl(req);
  const xml = buildSitemapXml(buildSitemapEntries(baseUrl));

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(xml);
});

app.get('/robots.txt', (req, res) => {
  const baseUrl = resolveBaseUrl(req);
  const lines = environment.environment === 'production'
    ? [
        'User-agent: *',
        'Allow: /',
        'Disallow: /sign-in',
        'Disallow: /sign-in/participant',
        'Disallow: /signin-token',
        `Sitemap: ${baseUrl}/sitemap.xml`,
      ]
    : [
        'User-agent: *',
        'Disallow: /',
      ];

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(`${lines.join('\n')}\n`);
});

// 3. Handle Angular Rendering
app.get('/{*path}', (req, res, next) => {
  angularAppEngine
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server
 */
if (isMainModule(import.meta.url)) {
  // RENDER FIX: Force port 10000 if PORT is missing
  const port = process.env['PORT'] || 10000;
  
  // RENDER FIX: Use a variable for host
  const host = '0.0.0.0';

  const server = app.listen(Number(port), host, () => {
    console.log(`Node Express server listening on http://${host}:${port}`);
  });
  
  // RENDER FIX: Increase timeouts for heavy Angular loads
  server.keepAliveTimeout = 120000;
  server.headersTimeout = 125000;
}

export const reqHandler = createNodeRequestHandler(app);
export default app;