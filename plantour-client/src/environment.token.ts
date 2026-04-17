import { InjectionToken } from '@angular/core';

export interface EnvironmentConfig {
  api: {
    baseUrl: string;
  };
  clientUrl: string;
  environment: string;
  paymentProvider: 'paddle' | 'lemonsqueezy' | 'stripe';
  googleClientId?: string;
  facebookAppId?: string;
  turnstileSiteKey?: string;
  paddleKey?: string;
  version: string;
  map: {
    apiKey: string;
    mapId: string;
    language: string;
    region: string;
    defaultCenter: {
      lat: number;
      lng: number;
    },
  };
}

export const ENVIRONMENT = new InjectionToken<EnvironmentConfig>('environment');
