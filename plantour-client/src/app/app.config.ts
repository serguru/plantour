import { APP_INITIALIZER, ApplicationConfig, ErrorHandler, inject, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { ENVIRONMENT } from '../environment.token';
import { environment } from '../environments/environment';
import { httpInterceptor } from './interceptors/http-interceptor';
import { GlobalErrorHandler } from './helpers/error-handler';
import { ClientSettingsService } from './services/client-settings-service';
import { CookieGuardService } from './services/cookie-guard-service';
import { LemonSqueezyService } from './services/lemon-squeezy-service';
import { PaddleService } from './services/paddle-service';
import { PaymentProcessorService } from './services/payment-processor-service';


export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ENVIRONMENT, useValue: environment },
    { provide: TINYMCE_SCRIPT_SRC, useValue: '/assets/tinymce/tinymce.min.js' },
    provideHttpClient(withInterceptors([httpInterceptor]),withFetch()),
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
            options: {
                // This forces the "light" version by default
                darkModeSelector: '.force-dark-only-if-this-class-exists', 
                cssLayer: false
            }
      }
    }),
    MessageService,
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [CookieGuardService],
      useFactory: (cookieGuardService: CookieGuardService) => () => cookieGuardService.init(),
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [ClientSettingsService],
      useFactory: (clientSettingsService: ClientSettingsService) => () => clientSettingsService.load(),
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
    {
      provide: PaymentProcessorService,
      useFactory: () => {
        const runtimeEnvironment = inject(ENVIRONMENT);

        return runtimeEnvironment.paymentProvider === 'paddle'
          ? inject(PaddleService)
          : inject(LemonSqueezyService);
      },
    }
  ]
};
