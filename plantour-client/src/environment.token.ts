import { InjectionToken } from '@angular/core';

export interface EnvironmentConfig {
  apiUrl: string;
  environment: string;
  googleClientId?: string;
  facebookAppId?: string;
}

export const ENVIRONMENT = new InjectionToken<EnvironmentConfig>('environment');
