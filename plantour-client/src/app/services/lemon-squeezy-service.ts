import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { PaymentProcessorService } from './payment-processor-service';

@Injectable({
  providedIn: 'root'
})
export class LemonSqueezyService extends PaymentProcessorService {
  private checkoutEventHandler?: (eventName: string) => void;
  private lemonInitPromise?: Promise<void>;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    super();
  }

  setCheckoutEventHandler(handler: ((eventName: string) => void) | undefined): void {
    this.checkoutEventHandler = handler;

    if (isPlatformBrowser(this.platformId) && window.LemonSqueezy) {
      this.setupLemon();
    }
  }

  activeSubscriptionExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.environment.api.baseUrl}/payment-processor/active-subscription-exists`, {
      params: { email }
    });
  }

  customerExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.environment.api.baseUrl}/payment-processor/customer-exists`, {
      params: { email }
    });
  }

  createCustomerPortalSession(): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.environment.api.baseUrl}/payment-processor/customer-portal-session`, {});
  }

  async closeCheckout(): Promise<void> {
    return;
  }

  async openInlineCheckout(options: {
    priceId: string;
    frameTarget: string;
    email?: string;
    redirectUrl?: string;
  }): Promise<string | undefined> {
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('Checkout is only available in the browser');
    }

    const session = await firstValueFrom(
      this.http.post<{ url: string }>(`${this.environment.api.baseUrl}/payment-processor/checkout-session`, {
        priceId: options.priceId,
        email: options.email,
        redirectUrl: options.redirectUrl
      })
    );

    if (!session?.url) {
      throw new Error('Checkout session URL was not returned');
    }

    return session.url;
  }

  private async ensureLemonLoaded(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (window.LemonSqueezy) {
      this.setupLemon();
      window.createLemonSqueezy?.();
      window.LemonSqueezy.Refresh();
      return;
    }

    if (!this.lemonInitPromise) {
      this.lemonInitPromise = new Promise<void>((resolve, reject) => {
        const existingScript = this.document.querySelector<HTMLScriptElement>('script[data-plantour-lemon-squeezy="true"]');

        if (existingScript) {
          existingScript.addEventListener('load', () => {
            this.setupLemon();
            window.createLemonSqueezy?.();
            window.LemonSqueezy?.Refresh();
            resolve();
          }, { once: true });
          existingScript.addEventListener('error', () => reject(new Error('Failed to load Lemon.js')), { once: true });
          return;
        }

        const script = this.document.createElement('script');
        script.src = 'https://app.lemonsqueezy.com/js/lemon.js';
        script.defer = true;
        script.dataset['plantourLemonSqueezy'] = 'true';

        script.onload = () => {
          this.setupLemon();
          window.createLemonSqueezy?.();
          window.LemonSqueezy?.Refresh();
          resolve();
        };

        script.onerror = () => reject(new Error('Failed to load Lemon.js'));

        this.document.body.appendChild(script);
      });
    }

    await this.lemonInitPromise;
  }

  private setupLemon(): void {
    window.LemonSqueezy?.Setup({
      eventHandler: event => {
        const mappedEvent = this.mapEventName(event?.event);

        if (mappedEvent) {
          this.checkoutEventHandler?.(mappedEvent);
        }
      }
    });
  }

  private mapEventName(eventName?: string): string | undefined {
    if (!eventName) {
      return undefined;
    }

    if (eventName === 'Checkout.Success') {
      return 'checkout.completed';
    }

    return undefined;
  }
}