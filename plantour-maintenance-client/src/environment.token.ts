import { InjectionToken } from '@angular/core';

export interface EnvironmentConfig {
  environment: string;
  api: {
    baseUrl: string;
  };
  clientUrl: string;
  appName: string;
}

export const ENVIRONMENT = new InjectionToken<EnvironmentConfig>('environment');
