import { AngularNodeAppEngine, createNodeRequestHandler, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';

const app = express();
const angularApp = new AngularNodeAppEngine();

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

export const reqHandler = createNodeRequestHandler(app);


// import {
//   AngularNodeAppEngine,
//   createNodeRequestHandler,
//   writeResponseToNodeResponse,
// } from '@angular/ssr/node';
// import express from 'express';
// import { fileURLToPath } from 'node:url';
// import { dirname, resolve, join } from 'node:path';

// const app = express();
// const angularApp = new AngularNodeAppEngine();

// /**
//  * 1. Setup paths
//  * In Angular SSR, the server.mjs file is inside dist/plantour-app/server.
//  * We need to point one level up and into the 'browser' folder.
//  */
// const serverDistFolder = dirname(fileURLToPath(import.meta.url));
// const browserDistFolder = resolve(serverDistFolder, '../browser');

// /**
//  * 2. Serve Static Files
//  * This ensures Render can find your styles.css, main.js, and images.
//  */
// app.use(
//   express.static(browserDistFolder, {
//     maxAge: '1y',
//     index: false, // Prevents express-static from serving index.html directly
//   })
// );

// /**
//  * 3. Handle Angular SSR requests
//  */
// app.use('*', (req, res, next) => {
//   angularApp
//     .handle(req)
//     .then((response) => {
//       if (response) {
//         writeResponseToNodeResponse(response, res);
//       } else {
//         next();
//       }
//     })
//     .catch(next);
// });

// /**
//  * 4. Start the Server
//  * Render provides the PORT environment variable.
//  */
// const port = process.env['PORT'] || 4000;

// app.listen(port, () => {
//   console.log(`Node Express server listening on http://localhost:${port}`);
// });

// /**
//  * Export the handler (useful for some serverless environments, 
//  * though Render uses the app.listen above).
//  */
// export const reqHandler = createNodeRequestHandler(app);