import { ApplicationConfig, ErrorHandler, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app-routes';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { jwtInterceptor } from './interceptors/jwt-interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastModule } from 'primeng/toast';
import { HttpErrorInterceptor } from './interceptors/http-error-interceptor';
import { GlobalErrorHandler } from './error-handlers/global-error-handler';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    ),

    importProvidersFrom(BrowserAnimationsModule, ToastModule),

    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },

    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: MessageService, useClass: MessageService }
  ]
};


