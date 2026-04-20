import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { PaymentProcessorService } from './payment-processor-service';

@Injectable({
  providedIn: 'root'
})
export class StripeService extends PaymentProcessorService {
  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    super();
  }

  setCheckoutEventHandler(_handler: ((eventName: string) => void) | undefined): void {
    return;
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
    void options.frameTarget;

    const session = await this.http.post<{ url: string }>(`${this.environment.api.baseUrl}/payment-processor/checkout-session`, {
      priceId: options.priceId,
      email: options.email,
      redirectUrl: options.redirectUrl
    }).toPromise();

    if (!session?.url) {
      throw new Error('Checkout session URL was not returned');
    }

    return session.url;
  }
}