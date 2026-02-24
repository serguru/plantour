import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PaddleService } from '../../services/paddle-service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { AppButton } from '../button/button-component';
import { MessagesService } from '../../services/messages-service';

// TODO: make sure this component works correctly for both registered and not registered users

@Component({
  selector: 'app-checkout-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, AppButton],
  templateUrl: './checkout-component.html',
  styleUrl: './checkout-component.scss',
})
export class CheckoutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly paddleService = inject(PaddleService);
  private readonly messagesService = inject(MessagesService);

  readonly checkoutContainerClass = 'paddle-inline-checkout-container';
  readonly emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  priceId: string | null = null;
  showCheckout = false;
  isLoading = false;
  errorMessage = '';
  private isHandlingCheckoutResult = false;

  ngOnInit(): void {
    this.paddleService.setCheckoutEventHandler((eventName: string) => {
      void this.onPaddleEvent(eventName);
    });

    this.priceId = this.route.snapshot.paramMap.get('priceId');

    if (!this.priceId) {
      this.errorMessage = 'Missing required query parameter: priceId';
    }
  }

  ngOnDestroy(): void {
    this.paddleService.setCheckoutEventHandler(undefined);
  }

  async onProceed(): Promise<void> {
    if (!this.priceId) {
      this.errorMessage = 'Missing required query parameter: priceId';
      return;
    }

    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    const email = this.emailForm.controls.email.value?.trim();
    if (!email) {
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    try {
      const hasActiveSubscription = await firstValueFrom(this.paddleService.activeSubscriptionExists(email));

      if (hasActiveSubscription) {
        this.isLoading = false;

        const result = await this.messagesService.openInfo({
          title: 'Subscription already exists',
          message: 'You already have an active subscription'
        });

        if (result === 'ok') {
          void this.router.navigate(['/profile']);
        }

        return;
      }

      this.showCheckout = true;
      this.cdr.detectChanges();
      await this.waitForInlineContainer();

      await this.paddleService.openInlineCheckout({
        priceId: this.priceId,
        email,
        frameTarget: this.checkoutContainerClass,
      });
    } catch (error: unknown) {
      this.showCheckout = false;
      this.errorMessage = error instanceof Error ? error.message : 'Unable to open checkout.';
      this.cdr.detectChanges();
    } finally {
      this.isLoading = false;
    }
  }

  get emailInvalid(): boolean {
    const control = this.emailForm.controls.email;
    return !!control && control.invalid && control.touched;
  }

  async onBackToFirstScreen(): Promise<void> {
    this.showCheckout = false;
    this.errorMessage = '';
    this.isLoading = false;
    this.isHandlingCheckoutResult = false;

    try {
      await this.paddleService.closeCheckout();
    } catch {
      // ignore close errors and still return to first screen
    }
  }

  private getQueryParamCaseInsensitive(queryMap: ParamMap, key: string): string | null {
    const normalizedKey = key.toLowerCase();
    const matchedKey = queryMap.keys.find(paramKey => paramKey.toLowerCase() === normalizedKey);

    if (!matchedKey) {
      return null;
    }

    return queryMap.get(matchedKey);
  }

  private async onPaddleEvent(eventName: string): Promise<void> {
    if (this.isHandlingCheckoutResult) {
      return;
    }

    if (eventName === 'checkout.completed') {
      this.isHandlingCheckoutResult = true;
      const result = await this.messagesService.openInfo({
        title: 'Subscription created',
        message: 'You subscribed successfully'
      });

      if (result === 'ok') {
        void this.router.navigate(['/profile']);
      }
      return;
    }

    if (eventName === 'checkout.payment.failed') {
      this.isHandlingCheckoutResult = true;
      const result = await this.messagesService.openInfo({
        title: 'Subscription failed',
        message: 'Failed creating a new subscription. Psease try again later.'
      });

      if (result === 'ok') {
        void this.router.navigate(['/profile']);
      }
    }
  }

  private async waitForInlineContainer(): Promise<void> {
    const maxAttempts = 10;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const element = document.querySelector(`.${this.checkoutContainerClass}`);
      if (element) {
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 20));
    }

    throw new Error('Checkout container is not ready. Please try again.');
  }

}
