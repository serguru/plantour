import { inject, Inject, Injectable, signal } from '@angular/core';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaddleService {
  paddle = signal<Paddle | undefined>(undefined);

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig

  ) {
    this.init();
  }

  lastCheckedEmail = null;
  isChecking = false;

  private async init() {
    const instance = await initializePaddle({
      environment: this.environment.environment === "production" ? 'production' : 'sandbox',
      token: 'test_c4c0e48b001d35f302e3ef618a6'
    });
    this.paddle.set(instance);
  }

  joinPrice(priceId: string, email: string) {

    const paddle = this.paddle();

    if (!paddle) {
      throw new Error('Paddle is not initialized yet');
    }

    paddle.Checkout.open({
      
      items: [
        {
          priceId: priceId,
          quantity: 1
        }
      ],
      // customer: {
      //     email: email
      // },
      settings: {
        displayMode: 'overlay',
        successUrl: this.environment.clientUrl + '/sign-in',
      },
    },
    );
  }
}

