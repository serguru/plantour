import { Inject, Injectable, signal } from '@angular/core';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

@Injectable({
  providedIn: 'root'
})
export class PaddleService {
  // We use a Signal to track the paddle instance reactively
  paddle = signal<Paddle | undefined>(undefined);

  constructor(
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig

  ) {
    this.init();
  }

  private async init() {
    const instance = await initializePaddle({
      environment: this.environment.environment === "production" ? 'production' : 'sandbox',
      token: 'test_c4c0e48b001d35f302e3ef618a6', // Found in Paddle Dashboard
      eventCallback: (event: any) => {
        if (event.name === 'checkout.completed') {
          console.log('Customer Email:', event.data.customer?.email);
        }
      }
    });
    this.paddle.set(instance);
  }

  joinPrice(priceId: string) {

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

      settings: {
        displayMode: 'overlay',
        successUrl: this.environment.clientUrl + '/sign-in?email={customer_email}&checkout_id={checkout_id}',

      },



    },




    );
  }


}