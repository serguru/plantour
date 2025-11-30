import { InjectionToken } from '@angular/core';

export interface EnvironmentConfig {
  apiUrl: string;
  production: boolean;
}

export const ENVIRONMENT = new InjectionToken<EnvironmentConfig>('environment');
