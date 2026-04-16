import { inject, Inject, Injectable, signal } from '@angular/core';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentProcessorService } from './payment-processor-service';

@Injectable({
  providedIn: 'root'
})
export class PaddleService extends PaymentProcessorService {
  paddle = signal<Paddle | undefined>(undefined);
  private readonly paddleInitPromise: Promise<void>;
  private readonly defaultFrameStyle = 'width: 100%; min-width: 312px; background-color: transparent; border: none;';
  private checkoutEventHandler?: (eventName: string) => void;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig

  ) {
    super();
    this.paddleInitPromise = this.init();
  }

  lastCheckedEmail = null;
  isChecking = false;

  private async init() {
    const token = this.environment.paddleKey;

    if (!token) {
      throw new Error('Paddle token is not configured');
    }

    const instance = await initializePaddle({
      environment: this.environment.environment === "production" ? 'production' : 'sandbox',
      token,
      eventCallback: (event) => {
        const eventName = event?.name;

        if (!eventName) {
          return;
        }

        this.checkoutEventHandler?.(eventName);
      }
    });

    if (!instance) {
      console.error('Failed to initialize Paddle');
      return;
    }

    this.paddle.set(instance);
  }

  setCheckoutEventHandler(handler: ((eventName: string) => void) | undefined): void {
    this.checkoutEventHandler = handler;
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
    const paddle = await this.getPaddleOrThrow();
    paddle.Checkout.close();
  }

  async openInlineCheckout(options: {
    priceId: string;
    frameTarget: string;
    email?: string;
    redirectUrl?: string;
  }): Promise<string | undefined> {

    const paddle = await this.getPaddleOrThrow();

    paddle.Checkout.open({
      items: [
        {
          priceId: options.priceId,
          quantity: 1
        }
      ],
      customer: options.email
        ? {
          email: options.email
        }
        : undefined,
      settings: {
        displayMode: 'inline',
        frameTarget: options.frameTarget,
        frameInitialHeight: 450,
        frameStyle: this.defaultFrameStyle,
        allowLogout: false
      }
    });

    return undefined;
  }

  private async getPaddleOrThrow(): Promise<Paddle> {
    await this.paddleInitPromise;

    const paddle = this.paddle();

    if (!paddle) {
      throw new Error('Paddle is not initialized yet');
    }

    return paddle;
  }


}

