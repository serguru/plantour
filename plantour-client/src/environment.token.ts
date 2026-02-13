import { InjectionToken } from '@angular/core';

export interface EnvironmentConfig {
  apiUrl: string;
  environment: string;
}

export const ENVIRONMENT = new InjectionToken<EnvironmentConfig>('environment');
