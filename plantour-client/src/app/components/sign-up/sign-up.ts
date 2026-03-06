import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { UsersService } from '../../services/users-service';
import { MessagesService } from '../../services/messages-service';
import { AppButton } from '../button/button-component';
import { SocialAuthService } from '../../services/social-auth-service';
import { ENVIRONMENT, EnvironmentConfig } from '../../../environment.token';
import { MessagePanel } from '../message-panel/message-panel-component/message-panel-component';

// TODO: while signing up check for a PaymentProcessor pending user and their payments and subscriptions
// TODO: add "or" to sign up instruction
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    AppButton
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUpComponent {
  componentId = 'sign-up';
  signUpForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  private usersService = inject(UsersService);
  private messagesService = inject(MessagesService);
  private socialAuthService = inject(SocialAuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);

  message = signal("To create an account: sign in with Google or Facebook account or enter your email. After signing up, check your email for a confirmation link to activate your account before signing in.");

  constructor(
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: ['']
    });
  }

  onSubmit(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      this.messagesService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, firstName, lastName } = this.signUpForm.value;

    this.usersService.registerAdmin({ email, firstName, lastName }).pipe(
      catchError((error) => {
        const errorMsg = error.error?.message || 'Sign up failed. Please try again.';
        this.errorMessage = errorMsg;
        this.messagesService.showError('Sign Up Failed', errorMsg);
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (response) => {

        if (response?.code === 'EMAIL_CONFIRMATION_REQUIRED') {
          this.messagesService.showInfo('Sign Up Successful', 'Check your email to confirm your account before signing in.');
          this.router.navigate(['/sign-in']);
          return;
        }

        this.messagesService.showInfo('Sign Up Successful', 'Enjoy Plantour!');
        this.router.navigate(['/dashboard']);

      }
    });
  }

  onBack(): void {
    this.location.back();
  }

  onLogoClick(): void {
    this.router.navigate(['']);
  }

  getFieldError(fieldName: string): string {
    const field = this.signUpForm.get(fieldName);
    if (!field || !field.touched) return '';

    if (field.hasError('required')) {
      return 'This field is required';
    }
    if (field.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signUpForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  onSignIn(): void {
    this.router.navigate(['/sign-in']);
  }

  async onSignUpWithFacebook(): Promise<void> {
    if (!this.environment.facebookAppId) {
      this.messagesService.showWarning('Facebook Login', 'Facebook App ID is not configured.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.socialAuthService.loadFacebookSdk(this.environment.facebookAppId);
      const accessToken = await this.socialAuthService.loginWithFacebook();
      this.signInWithSocial('facebook', accessToken);
    } catch (error: any) {
      this.isLoading = false;
      const errorMsg = error?.message || 'Facebook sign up failed. Please try again.';
      this.errorMessage = errorMsg;
      this.messagesService.showError('Sign Up Failed', errorMsg);
    }
  }

  async onSignUpWithGoogle(): Promise<void> {
    if (!this.environment.googleClientId) {
      this.messagesService.showWarning('Google Login', 'Google Client ID is not configured.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.socialAuthService.loadGoogleSdk();
      const googleSdk = (window as any).google;

      googleSdk.accounts.id.initialize({
        client_id: this.environment.googleClientId,
        use_fedcm_for_button: true,
        callback: (response: { credential?: string }) => {
          const idToken = response?.credential;
          if (!idToken) {
            this.isLoading = false;
            this.messagesService.showWarning('Google Login', 'Google authentication was cancelled.');
            return;
          }

          this.signInWithSocial('google', idToken);
        }
      });

      googleSdk.accounts.id.prompt();
    } catch {
      this.isLoading = false;
      this.messagesService.showWarning('Google Login', 'Google SDK failed to load.');
    }
  }

  private signInWithSocial(provider: 'google' | 'facebook', token: string): void {
    this.usersService.socialSignIn(provider, token).pipe(
      catchError((error) => {
        const errorMsg = error.error?.message || 'Social sign up failed. Please try again.';
        this.errorMessage = errorMsg;
        this.messagesService.showError('Sign Up Failed', errorMsg);
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (response) => {
        const message = response?.message || 'Welcome to Plantour';
        this.messagesService.showInfo('Sign In Successful', message);
        this.router.navigate(['']);
      }
    });
  }

}
