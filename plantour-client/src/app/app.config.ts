import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  GoogleInitOptions,
  SOCIAL_AUTH_CONFIG,
  SocialAuthServiceConfig,
} from '@abacritt/angularx-social-login';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { ENVIRONMENT } from '../environment.token';
import { environment } from '../environments/environment';
import { httpInterceptor } from './interceptors/http-interceptor';
import { GlobalErrorHandler } from './helpers/error-handler';

const googleProvider = environment.googleClientId
  ? {
      id: GoogleLoginProvider.PROVIDER_ID,
      provider: new GoogleLoginProvider(environment.googleClientId, {
        oneTapEnabled: false,
      } as GoogleInitOptions),
    }
  : null;

const facebookProvider = environment.facebookAppId
  ? {
      id: FacebookLoginProvider.PROVIDER_ID,
      provider: new FacebookLoginProvider(environment.facebookAppId, {
        scope: 'email,public_profile',
        fields: 'name,email,picture,first_name,last_name',
        version: 'v25.0',
      }),
    }
  : null;

const socialAuthConfig: SocialAuthServiceConfig = {
  autoLogin: false,
  lang: 'en',
  providers: [googleProvider, facebookProvider].filter((provider): provider is NonNullable<typeof provider> => provider !== null),
  onError: (error) => {
    console.error('Social auth initialization failed', error);
  },
};


export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ENVIRONMENT, useValue: environment },
    { provide: SOCIAL_AUTH_CONFIG, useValue: socialAuthConfig },
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
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    }
  ]
};
