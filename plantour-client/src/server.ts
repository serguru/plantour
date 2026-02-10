import { AngularNodeAppEngine, createNodeRequestHandler, writeResponseToNodeResponse } from '@angular/ssr/node';
import { ɵsetAngularAppEngineManifest, ɵsetAngularAppManifest } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

async function startServer(): Promise<void> {
  const appEngineManifestUrl = new URL('./angular-app-engine-manifest.mjs', import.meta.url);
  const appManifestUrl = new URL('./angular-app-manifest.mjs', import.meta.url);

  const appEngineManifest = await import(appEngineManifestUrl.toString());
  const appManifest = await import(appManifestUrl.toString());

  ɵsetAngularAppEngineManifest(appEngineManifest.default);
  ɵsetAngularAppManifest(appManifest.default);

  const app = express();
  const angularApp = new AngularNodeAppEngine();

  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');

  app.get('/healthz', (_req, res) => {
    res.status(200).send('ok');
  });

  app.use(
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: false,
    })
  );

  app.use('*', (req, res, next) => {
    angularApp
      .handle(req)
      .then((response) => {
        if (response) {
          writeResponseToNodeResponse(response, res);
        } else {
          next();
        }
      })
      .catch(next);
  });

  const portFromEnv = process.env['PORT'];
  const port = portFromEnv ? Number.parseInt(portFromEnv, 10) : 4000;
  const listenPort = Number.isFinite(port) ? port : 4000;

  app.listen(listenPort, '0.0.0.0', () => {
    console.log(`Node Express server listening on http://0.0.0.0:${listenPort}`);
  });

  reqHandler = createNodeRequestHandler(app);
}

let reqHandler = createNodeRequestHandler((_req, _res, next) => next());

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { reqHandler };