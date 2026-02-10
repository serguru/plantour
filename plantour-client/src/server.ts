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

// 1. Initialize Express and the Angular Engine immediately
const app = express();
const angularApp = new AngularNodeAppEngine();

async function startServer(): Promise<void> {
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');

  // 2. Load Manifests
  const appEngineManifestUrl = new URL('./angular-app-engine-manifest.mjs', import.meta.url);
  const appManifestUrl = new URL('./angular-app-manifest.mjs', import.meta.url);

  const [appEngineManifest, appManifest] = await Promise.all([
    import(appEngineManifestUrl.toString()),
    import(appManifestUrl.toString())
  ]);

  ɵsetAngularAppEngineManifest(appEngineManifest.default);
  ɵsetAngularAppManifest(appManifest.default);

  // 3. Health Check (Crucial for Render to detect a 'Live' status quickly)
  app.get('/healthz', (_req, res) => {
    res.status(200).send('OK');
  });

  // 4. Static Assets
  app.use(
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: false,
    })
  );

  // 5. Angular SSR Handling
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

  // 6. Port and Host binding
  // Render automatically assigns a PORT env var; we must use it.
  const port = process.env['PORT'] || 4000;
  const host = '0.0.0.0'; 

  app.listen(port, () => {
    console.log(`Node Express server listening on http://${host}:${port}`);
  });
}

// 7. Fire it up
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// 8. Export the handler for the Angular CLI/Node environment
export const reqHandler = createNodeRequestHandler(app);

