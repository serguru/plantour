import { ApplicationConfig, ErrorHandler, inject, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
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

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ENVIRONMENT, useValue: environment },
    provideHttpClient(withInterceptors([httpInterceptor])),
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
