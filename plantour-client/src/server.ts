import {
  AngularNodeAppEngine,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { environment } from './environments/environment';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularAppEngine = new AngularNodeAppEngine();

function isAuthPage(path: string): boolean {
  const normalizedPath = (path || '/').replace(/\/+$/, '') || '/';
  return normalizedPath === '/sign-in'
    || normalizedPath.startsWith('/sign-in/')
    || normalizedPath === '/signin-token';
}

app.use((req, res, next) => {
  if (environment.environment !== 'production' || isAuthPage(req.path)) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  }

  next();
});

// 1. Serve static files
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// 2. Health Check (Crucial for Render)
// This gives Render a "dumb" endpoint to hit that doesn't trigger the Angular Engine.
// If this works, Render will pass the port scan instantly.
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 3. Handle Angular Rendering
app.get('**', (req, res, next) => {
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

export default app;