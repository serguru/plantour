// import { AngularNodeAppEngine, createNodeRequestHandler, writeResponseToNodeResponse } from '@angular/ssr/node';
// import { ɵsetAngularAppEngineManifest, ɵsetAngularAppManifest } from '@angular/ssr';
// import express from 'express';
// import { fileURLToPath } from 'node:url';
// import { dirname, resolve } from 'node:path';

// async function startServer(): Promise<void> {
//   const appEngineManifestUrl = new URL('./angular-app-engine-manifest.mjs', import.meta.url);
//   const appManifestUrl = new URL('./angular-app-manifest.mjs', import.meta.url);

//   const appEngineManifest = await import(appEngineManifestUrl.toString());
//   const appManifest = await import(appManifestUrl.toString());

//   ɵsetAngularAppEngineManifest(appEngineManifest.default);
//   ɵsetAngularAppManifest(appManifest.default);

//   const app = express();
//   const angularApp = new AngularNodeAppEngine();

//   const serverDistFolder = dirname(fileURLToPath(import.meta.url));
//   const browserDistFolder = resolve(serverDistFolder, '../browser');

//   app.get('/healthz', (_req, res) => {
//     res.status(200).send('ok');
//   });

//   app.use(
//     express.static(browserDistFolder, {
//       maxAge: '1y',
//       index: false,
//     })
//   );

//   app.use('*', (req, res, next) => {
//     angularApp
//       .handle(req)
//       .then((response) => {
//         if (response) {
//           writeResponseToNodeResponse(response, res);
//         } else {
//           next();
//         }
//       })
//       .catch(next);
//   });

//   const portFromEnv = process.env['PORT'];
//   const port = portFromEnv ? Number.parseInt(portFromEnv, 10) : 4000;
//   const listenPort = Number.isFinite(port) ? port : 4000;

//   const host = process.env['HOST'] ?? '0.0.0.0';
//   const server = app.listen(listenPort, host, () => {
//     console.log(`Node Express server listening on http://${host}:${listenPort}`);
//   });

//   server.on('error', (error) => {
//     console.error('Failed to bind HTTP server:', error);
//     process.exit(1);
//   });

//   reqHandler = createNodeRequestHandler(app);
// }

// let reqHandler = createNodeRequestHandler((_req, _res, next) => next());

// startServer().catch((error) => {
//   console.error('Failed to start server:', error);
//   process.exit(1);
// });

// export { reqHandler };




import { AngularNodeAppEngine, createNodeRequestHandler, writeResponseToNodeResponse } from '@angular/ssr/node';
import { ɵsetAngularAppEngineManifest, ɵsetAngularAppManifest } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const app = express();

async function startServer(): Promise<void> {
  // 1. Resolve paths
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');

  // 2. Load Manifests FIRST
  const appEngineManifestUrl = new URL('./angular-app-engine-manifest.mjs', import.meta.url);
  const appManifestUrl = new URL('./angular-app-manifest.mjs', import.meta.url);

  const [appEngineManifest, appManifest] = await Promise.all([
    import(appEngineManifestUrl.toString()),
    import(appManifestUrl.toString())
  ]);

  // 3. Set Manifests BEFORE initializing the Engine
  ɵsetAngularAppEngineManifest(appEngineManifest.default);
  ɵsetAngularAppManifest(appManifest.default);

  // 4. Now initialize the engine
  const angularApp = new AngularNodeAppEngine();

  // 5. Health Check for Render
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

  // 6. Bind to Port
  const port = process.env['PORT'] || 4000;
  // Note: Render requires binding to 0.0.0.0
  app.listen(port, () => {
    console.log(`Node Express server listening on http://0.0.0.0:${port}`);
  });
}

// Start sequence
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Export the handler
export const reqHandler = createNodeRequestHandler(app);