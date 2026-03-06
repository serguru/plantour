import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { UsersService } from '../../services/users-service';
import { MessagesService } from '../../services/messages-service';
import { RadioButton } from 'primeng/radiobutton';
import { AppButton } from '../button/button-component';
import { ENVIRONMENT, EnvironmentConfig } from '../../../environment.token';
import { SocialAuthService } from '../../services/social-auth-service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    RadioButton,
    FormsModule,
    AppButton
  ],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignInComponent implements OnInit {
  componentId = 'sign-in';
  adminForm: FormGroup;
  participantForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  signInType: 'admin' | 'participant' = 'admin';

  private usersService = inject(UsersService);
  private messagesService = inject(MessagesService);
  private socialAuthService = inject(SocialAuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);

  constructor(
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {

    let e = "";

    if (this.environment.environment === 'development') {
      e = 'serguru@gmail.com';
    }

    this.adminForm = this.fb.group({
      email: [e, [Validators.required, Validators.email]]
    });
    this.participantForm = this.fb.group({
      accessCode: ['', [Validators.required]],
    });
  }
  ngOnInit(): void {
    const currentUrl = this.router.url; 
    const endsWithParticipant = currentUrl.split('?')[0].endsWith('/participant');    
    this.signInType = endsWithParticipant ? 'participant' : 'admin';
  }

  get isAdmin(): boolean {
    return this.signInType === 'admin';
  }

  get currentForm(): FormGroup {
    return this.isAdmin ? this.adminForm : this.participantForm;
  }

  onSubmit(): void {
    if (this.currentForm.invalid) {
      this.currentForm.markAllAsTouched();
      this.messagesService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isAdmin) {

      const { email } = this.currentForm.value;
      this.usersService.loginAdmin(email).pipe(
        catchError((error) => {
          const errorMsg = error.error?.message || 'Sign in failed. Please check your credentials and try again.';
          this.errorMessage = errorMsg;
          this.messagesService.showError('Sign In Failed', errorMsg);
          return EMPTY;
        }),
        finalize(() => {
          this.isLoading = false;
        })
      ).subscribe({
        next: (response) => {
          const message = response?.message || 'Welcome back to Plantour';
          this.messagesService.showInfo('Sign In Successful', message);
          this.router.navigate(['']);
        }
      });
      return;
    }


    const { accessCode } = this.currentForm.value;

    this.usersService.loginParticipant(accessCode).pipe(
      catchError((error) => {
        const errorMsg = error.error?.message || 'Participant sign in failed. Please check your Access Code and try again.';
        this.errorMessage = errorMsg;
        this.messagesService.showError('Sign In Failed', errorMsg);
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (response) => {
        const message = response?.message || 'Welcome back to Plantour';
        this.messagesService.showInfo('Sign In Successful', message);
        this.router.navigate(['']);
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
    const field = this.currentForm.get(fieldName);
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
    const field = this.currentForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  onSignUp(): void {
    this.router.navigate(['/sign-up']);
  }

  async onSignInWithFacebook(): Promise<void> {
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
      const errorMsg = error?.message || 'Facebook sign in failed. Please try again.';
      this.errorMessage = errorMsg;
      this.messagesService.showError('Sign In Failed', errorMsg);
    }
  }

  async onSignInWithGoogle(): Promise<void> {
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
        const errorMsg = error.error?.message || 'Social sign in failed. Please try again.';
        this.errorMessage = errorMsg;
        this.messagesService.showError('Sign In Failed', errorMsg);
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
