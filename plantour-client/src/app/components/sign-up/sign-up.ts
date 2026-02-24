import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { UsersService } from '../../services/users-service';
import { MessagesService } from '../../services/messages-service';
import { AppButton } from '../button/button-component';
import { SocialAuthService } from '../../services/social-auth-service';
import { ENVIRONMENT, EnvironmentConfig } from '../../../environment.token';
import { MessagePanel } from '../message-panel/message-panel-component/message-panel-component';

// TODO: while signing up check for a PaymentProcessor pending user and their payments and subscriptions
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
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

  message = signal("To create an account: sign in with Google or Facebook account or enter your email and password. After signing up, check your email for a confirmation link to activate your account before signing in.");

  constructor(
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      this.messagesService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, firstName, lastName, phone, password } = this.signUpForm.value;

    this.usersService.registerAdmin({ email, password, firstName, lastName }).pipe(
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
      next: () => {
        this.messagesService.showInfo('Sign Up Successful', 'Check your email to confirm your account before signing in.');
        this.router.navigate(['/sign-in']);
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
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `Password must be at least ${minLength} characters`;
    }
    return '';
  }

  getConfirmPasswordError(): string {
    const field = this.signUpForm.get('confirmPassword');
    if (!field || !field.touched) return '';

    if (field.hasError('required')) {
      return 'This field is required';
    }
    if (this.signUpForm.hasError('passwordMismatch') && field.touched) {
      return 'Passwords do not match';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signUpForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  isConfirmPasswordInvalid(): boolean {
    const field = this.signUpForm.get('confirmPassword');
    return !!(field && field.touched && (field.invalid || this.signUpForm.hasError('passwordMismatch')));
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
