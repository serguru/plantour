import { ApplicationConfig, ErrorHandler, inject, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { ENVIRONMENT } from '../environment.token';
import { environment } from '../environments/environment';
import { httpInterceptor } from './interceptors/http-interceptor';
import { GlobalErrorHandler } from './helpers/error-handler';


// TODO: remove 
// file robots.txt 
// <meta name="robots" content="noindex, nofollow"> and
// <link rel="canonical" href="https://plantour.app/current-page" /> from index.html
// X-Robots-Tag: noindex, nofollow from server response
// ui upper banner "non-production environment - test data only"
// before deploying to production, and remove this comment
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ENVIRONMENT, useValue: environment },
    provideHttpClient(withInterceptors([httpInterceptor]),withFetch()),
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    MessageService,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    }
  ]
};
