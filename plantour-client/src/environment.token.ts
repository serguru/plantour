import { InjectionToken } from '@angular/core';

export interface EnvironmentConfig {
  api: {
    baseUrl: string;
  };
  clientUrl: string;
  environment: string;
  googleClientId?: string;
  facebookAppId?: string;
  turnstileSiteKey?: string;
  paddleKey: string;
  version: string;
}

export const ENVIRONMENT = new InjectionToken<EnvironmentConfig>('environment');
