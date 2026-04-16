
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { catchError, EMPTY, firstValueFrom, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AppButton } from '../button/button-component';
import { MessagesService } from '../../services/messages-service';
import { UsersService } from '../../services/users-service';
import { PaymentProcessorService } from '../../services/payment-processor-service';
import { ENVIRONMENT, EnvironmentConfig } from '../../../environment.token';

@Component({
  selector: 'app-checkout-component',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, AppButton],
  templateUrl: './checkout-component.html',
  styleUrl: './checkout-component.scss',
})
export class CheckoutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly paymentProcessorService = inject(PaymentProcessorService);
  private readonly messagesService = inject(MessagesService);
  private readonly usersService = inject(UsersService);
  private readonly environment = inject<EnvironmentConfig>(ENVIRONMENT);

  readonly checkoutContainerClass = 'paddle-inline-checkout-container';
  readonly emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  priceId: string | null = null;
  priceName: string | null = null;
  showCheckout = false;
  isLoading = false;
  errorMessage = '';
  private isHandlingCheckoutResult = false;

  onEmailInput(ev: Event): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  ngOnInit(): void {
    this.paymentProcessorService.setCheckoutEventHandler((eventName: string) => {
      void this.onCheckoutEvent(eventName);
    });

    // This should never happen because the route is protected, but just in case
    this.priceId = this.route.snapshot.paramMap.get('priceId');
    if (!this.priceId) {
      this.errorMessage = 'Missing required query parameter: priceId';
    }
    this.priceName = this.route.snapshot.paramMap.get('priceName');
    if (!this.priceName) {
      this.errorMessage = 'Missing required query parameter: priceName';
    }

    this.route.queryParamMap.subscribe(params => {
      const email = params.get('email');
      if (!email) {
        return;
      }
      this.emailForm.setValue({
        email: email
      });
    });
  }

  ngOnDestroy(): void {
    this.paymentProcessorService.setCheckoutEventHandler(undefined);
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

    // if the temporary user convert them first
    if (this.usersService.isTemporarySignal()) {
      const oldEmail = this.usersService.userEmail();

      if (!oldEmail) {
        this.errorMessage = 'Missing temporary user email';
        return;
      }

      await firstValueFrom(
        this.usersService.convertTemporaryUser(oldEmail, email).pipe(
          tap(() => {
            this.usersService.signOut();
          }),
          catchError((error: any) => {
            let errorMessage = 'Failed to convert temporary user. ';
            if (error?.error?.isCustom && error?.error?.message) {
              errorMessage += error.error.message;
            } else if (error?.message) {
              errorMessage += error.message;
            }
            this.errorMessage = errorMessage;
            return throwError(() => new Error(errorMessage));
          })
        )
      )
    }


    this.errorMessage = '';
    this.isLoading = true;

    try {
      const customerExists = await firstValueFrom(this.paymentProcessorService.customerExists(email));

      if (customerExists) {
        this.isLoading = false;
        this.errorMessage = "This email is already registered in the payment system. Please sign in with that email or use a different email address.";
        return;
      }

      const isTemporary = await firstValueFrom(this.usersService.isUserTemporary(email));

      if (isTemporary) {
        this.isLoading = false;
        this.errorMessage = "A temporary user with this email address was found. Temporary users cannot have a paid plan. Please enter a different email address.";
        return;
      }

      this.showCheckout = true;
      this.cdr.detectChanges();

      const redirectUrl = `${this.environment.clientUrl}/sign-in?email=${encodeURIComponent(email)}`;

      const checkoutUrl = await this.paymentProcessorService.openInlineCheckout({
        priceId: this.priceId,
        email,
        frameTarget: this.checkoutContainerClass,
        redirectUrl,
      });

      if (checkoutUrl) {
        this.showCheckout = false;

        const dialogResult = await this.messagesService.openOkCancel({
          title: 'Confirm email before checkout',
          message: `You will be redirected to the secure Lemon Squeezy checkout. Do not change the email address there. Keep using ${email} so your subscription stays linked to the correct Plantour account.`,
          okLabel: 'Continue',
          cancelLabel: 'Cancel'
        });

        if (dialogResult !== 'ok') {
          return;
        }

        window.location.assign(checkoutUrl);
        return;
      } else {
        await this.waitForInlineContainer();
      }
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
      await this.paymentProcessorService.closeCheckout();
    } catch {
      // ignore close errors and still return to first screen
    }
  }

  private async onCheckoutEvent(eventName: string): Promise<void> {
    if (this.isHandlingCheckoutResult) {
      return;
    }

    if (eventName === 'checkout.completed') {
      this.isHandlingCheckoutResult = true;
      const result = await this.messagesService.openInfo({
        title: 'Subscription created',
        message: 'You subscribed successfully. Please sign in.'
      });

      if (result === 'ok') {
      }
      this.usersService.signOut();

      this.router.navigate(['/sign-in'], {
        queryParams: { email: this.emailForm.get("email")!.value }
      });

      return;
    }

    if (eventName === 'checkout.payment.failed') {
      this.isHandlingCheckoutResult = true;
      const result = await this.messagesService.openInfo({
        title: 'Subscription failed',
        message: 'Failed creating a new subscription. Psease try again later.'
      });

      if (result === 'ok') {
      }
      void this.router.navigate(['/profile']);
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
