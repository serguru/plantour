import { InjectionToken } from '@angular/core';

export interface EnvironmentConfig {
  apiUrl: string;
  clientUrl: string;
  environment: string;
  googleClientId?: string;
  facebookAppId?: string;
  turnstileSiteKey?: string;
  version: string;
}

export const ENVIRONMENT = new InjectionToken<EnvironmentConfig>('environment');
