import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

interface TurnstileRenderOptions {
  sitekey: string;
  action?: string;
  size?: 'invisible';
  callback: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
}

interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileRenderOptions): string;
  execute(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

@Injectable({
  providedIn: 'root'
})
export class BotProtectionService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private scriptLoadPromise?: Promise<void>;

  constructor(
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {}

  async getToken(action: string): Promise<string | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const siteKey = this.environment.turnstileSiteKey;
    if (!siteKey) {
      return null;
    }

    await this.ensureScriptLoaded();

    const turnstile = window.turnstile;
    if (!turnstile || !this.document.body) {
      throw new Error('Human verification is temporarily unavailable. Please try again.');
    }

    const container = this.document.createElement('div');
    container.setAttribute('aria-hidden', 'true');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    this.document.body.appendChild(container);

    return new Promise<string>((resolve, reject) => {
      let widgetId = '';

      const cleanup = () => {
        if (widgetId && window.turnstile) {
          window.turnstile.remove(widgetId);
        }

        container.remove();
      };

      try {
        widgetId = turnstile.render(container, {
          sitekey: siteKey,
          action,
          size: 'invisible',
          callback: (token: string) => {
            cleanup();
            resolve(token);
          },
          'error-callback': () => {
            cleanup();
            reject(new Error('Human verification failed. Please try again.'));
          },
          'expired-callback': () => {
            cleanup();
            reject(new Error('Human verification expired. Please try again.'));
          },
          'timeout-callback': () => {
            cleanup();
            reject(new Error('Human verification timed out. Please try again.'));
          }
        });

        turnstile.execute(widgetId);
      } catch {
        cleanup();
        reject(new Error('Human verification is temporarily unavailable. Please try again.'));
      }
    });
  }

  private ensureScriptLoaded(): Promise<void> {
    if (window.turnstile) {
      return Promise.resolve();
    }

    if (this.scriptLoadPromise) {
      return this.scriptLoadPromise;
    }

    this.scriptLoadPromise = new Promise<void>((resolve, reject) => {
      const existingScript = this.document.querySelector<HTMLScriptElement>('script[data-plantour-turnstile="true"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load human verification.')), { once: true });
        return;
      }

      const script = this.document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset['plantourTurnstile'] = 'true';
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => reject(new Error('Failed to load human verification.')), { once: true });
      this.document.head.appendChild(script);
    });

    return this.scriptLoadPromise;
  }
}