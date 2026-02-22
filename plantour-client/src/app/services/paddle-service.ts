import { inject, Inject, Injectable, signal } from '@angular/core';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaddleService {
  paddle = signal<Paddle | undefined>(undefined);
  private readonly paddleInitPromise: Promise<void>;
  private readonly defaultFrameStyle = 'width: 100%; min-width: 312px; background-color: transparent; border: none;';
  private checkoutEventHandler?: (eventName: string) => void;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig

  ) {
    this.paddleInitPromise = this.init();
  }

  lastCheckedEmail = null;
  isChecking = false;

  private async init() {
    const instance = await initializePaddle({
      environment: this.environment.environment === "production" ? 'production' : 'sandbox',
      token: 'test_c4c0e48b001d35f302e3ef618a6',
      eventCallback: (event) => {
        const eventName = event?.name;

        if (!eventName) {
          return;
        }

        this.checkoutEventHandler?.(eventName);
      }
    });

    if (!instance) {
      throw new Error('Unable to initialize Paddle');
    }

    this.paddle.set(instance);
  }

  // joinPrice(priceId: string, email?: string): void {
  //   void this.openOverlayCheckout(priceId, email);
  // }

  setCheckoutEventHandler(handler: ((eventName: string) => void) | undefined): void {
    this.checkoutEventHandler = handler;
  }

  activeSubscriptionExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.environment.apiUrl}/api/paddle/active-subscription-exists`, {
      params: { email }
    });
  }

  async closeCheckout(): Promise<void> {
    const paddle = await this.getPaddleOrThrow();
    paddle.Checkout.close();
  }

  async openInlineCheckout(options: {
    priceId: string;
    frameTarget: string;
    email?: string;
  }): Promise<void> {

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
  }

  // private async openOverlayCheckout(priceId: string, email?: string): Promise<void> {

  //   const paddle = await this.getPaddleOrThrow();


  //   paddle.Checkout.open({
      
  //     items: [
  //       {
  //         priceId: priceId,
  //         quantity: 1
  //       }
  //     ],
  //     customer: email
  //       ? {
  //         email: email
  //       }
  //       : undefined,
  //     settings: {
  //       displayMode: 'overlay',
  //     },
  //   },
  //   );
  // }

  private async getPaddleOrThrow(): Promise<Paddle> {
    await this.paddleInitPromise;

    const paddle = this.paddle();

    if (!paddle) {
      throw new Error('Paddle is not initialized yet');
    }

    return paddle;
  }
}

