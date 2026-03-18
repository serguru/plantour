import { Component, DestroyRef, Inject, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  GoogleSigninButtonDirective,
  SocialAuthService,
  SocialUser,
} from '@abacritt/angularx-social-login';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsersService } from '../../services/users-service';
import { MessagesService } from '../../services/messages-service';
import { RadioButton } from 'primeng/radiobutton';
import { AppButton } from '../button/button-component';
import { ENVIRONMENT, EnvironmentConfig } from '../../../environment.token';
import { BotProtectionService } from '../../services/bot-protection-service';
import { PasswordModule } from 'primeng/password';
import { SignInResponse } from '../../models/auth.models';
import { getMessageFromError } from '../../helpers/utils';

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
    AppButton,
    PasswordModule,
    GoogleSigninButtonDirective,
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
  successMessage = '';
  signInType: 'admin' | 'participant' = 'admin';
  hasGoogleLogin = false;
  hasFacebookLogin = false;
  private pendingGoogleLogin = false;

  private usersService = inject(UsersService);
  private messagesService = inject(MessagesService);
  private socialAuthService = inject(SocialAuthService);
  private botProtectionService = inject(BotProtectionService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);

  constructor(
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.hasGoogleLogin = !!this.environment.googleClientId;
    this.hasFacebookLogin = !!this.environment.facebookAppId;

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

    onRadioClick(event): void {
      this.successMessage = '';
      this.errorMessage = '';
    }

  ngOnInit(): void {
    const currentUrl = this.router.url; 

    const parts = currentUrl.split('?');
    const path = parts[0];
    const endsWithParticipant = path.endsWith('/participant');  

    this.signInType = endsWithParticipant ? 'participant' : 'admin';

    const queryParams = new URLSearchParams(parts[1]);

    if (this.signInType === 'admin') {
      const email = queryParams.get('email');
      if (email) { 
        this.adminForm.patchValue({ email: email });
      }
    }

    this.socialAuthService.authState
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        if (!user || !this.pendingGoogleLogin || user.provider !== GoogleLoginProvider.PROVIDER_ID) {
          return;
        }

        this.pendingGoogleLogin = false;
        void this.completeSocialSignInFromUser('google', user, 'Google');
      });
  }

  onEmailChange(e) {
    this.errorMessage = '';
    this.successMessage = '';  
  }

  get isAdmin(): boolean {
    return this.signInType === 'admin';
  }

  get currentForm(): FormGroup {
    return this.isAdmin ? this.adminForm : this.participantForm;
  }

  async onSubmit(): Promise<void> {
    this.successMessage = '';
    this.errorMessage = '';


    if (this.currentForm.invalid) {
      this.currentForm.markAllAsTouched();
      this.messagesService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    const currentEmail = this.usersService.userEmail();
    if (currentEmail && currentEmail.toLowerCase() == this.adminForm.get('email')!.value.toLowerCase()) {
      this.messagesService.showWarning('Already Signed In', 'You are already signed in with this email');
      return;
    }

    this.isLoading = true;

    if (this.isAdmin) {
      let botProtectionToken: string | null = null;

      try {
        botProtectionToken = await this.botProtectionService.getToken('admin_signin_email');
      } catch (error: any) {
        this.isLoading = false;
        this.errorMessage = error?.message || 'Human verification failed. Please try again.';
        return;
      }

      const { email } = this.currentForm.value;
      this.usersService.sendLoginEmailAdmin(email, botProtectionToken).pipe(
        catchError((error) => {
          const errorMsg = getMessageFromError(error, 'Sending sign-in email failed');
          this.errorMessage = errorMsg;
          return EMPTY;
        }),
        finalize(() => {
          this.isLoading = false;
        })
      ).subscribe({
        next: (response: SignInResponse) => {
          this.successMessage = `Hello ${response.fullUserName}, we've sent you an email with a link that will be valid for ${response.signInEmailTokenMinutes} minutes. Please open the email and follow the link to sign in to Plantour.`;
        }
      });
      return;
    }

    let botProtectionToken: string | null = null;

    try {
      botProtectionToken = await this.botProtectionService.getToken('participant_signin');
    } catch (error: any) {
      this.isLoading = false;
      this.errorMessage = error?.message || 'Human verification failed. Please try again.';
      return;
    }

    const { accessCode } = this.currentForm.value;
    this.usersService.loginParticipant(accessCode, botProtectionToken).pipe(
      catchError((error) => {
        const errorMsg = getMessageFromError(error, 'Participant sign in failed. Please check your Access Code and try again.');
        this.errorMessage = errorMsg;
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (response) => {
        const message = response?.message || 'Welcome back to Plantour';
        this.messagesService.showInfo('Sign In Successful', message);
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

  async onSignInWithFacebook(): Promise<void> {
    if (!this.hasFacebookLogin) {
      this.messagesService.showWarning('Facebook Login', 'Facebook App ID is not configured.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const user = await this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID, {
        scope: 'email,public_profile',
      });

      await this.completeSocialSignInFromUser('facebook', user, 'Facebook');
    } catch (error: any) {
      this.isLoading = false;
      const errorMsg = error?.message || 'Facebook sign in failed. Please try again.';
      this.errorMessage = errorMsg;
      this.messagesService.showError('Sign In Failed', errorMsg);
    }
  }

  onGoogleSignInClick(): void {
    if (!this.hasGoogleLogin) {
      this.messagesService.showWarning('Google Login', 'Google Client ID is not configured.');
      return;
    }

    if (this.isLoading) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.pendingGoogleLogin = true;
  }

  private async completeSocialSignInFromUser(
    provider: 'google' | 'facebook',
    user: SocialUser,
    providerName: string
  ): Promise<void> {
    const token = provider === 'google' ? user.idToken : user.authToken;

    if (!token) {
      this.isLoading = false;
      this.errorMessage = `${providerName} authentication token was not returned.`;
      this.messagesService.showError('Sign In Failed', this.errorMessage);
      return;
    }

    this.isLoading = true;

    try {
      await this.signInWithSocial(provider, token);
    } catch (error: any) {
      this.isLoading = false;
      const errorMsg = error?.message || `${providerName} sign in failed. Please try again.`;
      this.errorMessage = errorMsg;
      this.messagesService.showError('Sign In Failed', errorMsg);
    }
  }

  private async signInWithSocial(provider: 'google' | 'facebook', token: string): Promise<void> {
    let botProtectionToken: string | null = null;

    try {
      botProtectionToken = await this.botProtectionService.getToken(`${provider}_social_signin`);
    } catch (error: any) {
      this.isLoading = false;
      const errorMsg = error?.message || 'Human verification failed. Please try again.';
      this.errorMessage = errorMsg;
      this.messagesService.showError('Sign In Failed', errorMsg);
      return;
    }

    this.usersService.socialSignIn(provider, token, botProtectionToken).pipe(
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
        this.router.navigate(['/dashboard']);
      }
    });
  }

}
