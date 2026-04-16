import { Observable } from 'rxjs';

export abstract class PaymentProcessorService {
  abstract setCheckoutEventHandler(handler: ((eventName: string) => void) | undefined): void;
  abstract activeSubscriptionExists(email: string): Observable<boolean>;
  abstract createCustomerPortalSession(): Observable<{ url: string }>;
  abstract closeCheckout(): Promise<void>;
  abstract openInlineCheckout(options: {
    priceId: string;
    frameTarget: string;
    email?: string;
  }): Promise<void>;
}