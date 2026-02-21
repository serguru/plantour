import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PaddleService } from '../../services/paddle-service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule],
  templateUrl: './checkout-component.html',
  styleUrl: './checkout-component.scss',
})
export class CheckoutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly paddleService = inject(PaddleService);

  readonly checkoutContainerClass = 'paddle-inline-checkout-container';
  readonly emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  priceId: string | null = null;
  showCheckout = false;
  statusMessage = '';
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const queryMap = this.route.snapshot.queryParamMap;
    this.priceId = this.getQueryParamCaseInsensitive(queryMap, 'priceId');

    if (!this.priceId) {
      this.errorMessage = 'Missing required query parameter: priceId';
    }
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
    this.statusMessage = '';
    this.isLoading = true;

    try {
      const hasActiveSubscription = await firstValueFrom(this.paddleService.activeSubscriptionExists(email));

      if (hasActiveSubscription) {
        this.statusMessage = 'You already have an active subscription';
        this.isLoading = false;
        setTimeout(() => {
          void this.router.navigate(['/profile']);
        }, 1200);
        return;
      }

      this.showCheckout = true;
      this.cdr.detectChanges();

      await this.paddleService.openInlineCheckout({
        priceId: this.priceId,
        email,
        frameTarget: this.checkoutContainerClass,
      });
    } catch (error: unknown) {
      this.errorMessage = error instanceof Error ? error.message : 'Unable to open checkout.';
    } finally {
      this.isLoading = false;
    }
  }

  get emailInvalid(): boolean {
    const control = this.emailForm.controls.email;
    return !!control && control.invalid && control.touched;
  }

  private getQueryParamCaseInsensitive(queryMap: ParamMap, key: string): string | null {
    const normalizedKey = key.toLowerCase();
    const matchedKey = queryMap.keys.find(paramKey => paramKey.toLowerCase() === normalizedKey);

    if (!matchedKey) {
      return null;
    }

    return queryMap.get(matchedKey);
  }

}
