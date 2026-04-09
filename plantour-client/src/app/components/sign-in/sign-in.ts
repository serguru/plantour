import { Component, computed, HostListener, Inject, inject, OnInit, signal } from '@angular/core';
import { DOCUMENT, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { UsersService } from '../../services/users-service';
import { MessagesService } from '../../services/messages-service';
import { RadioButton } from 'primeng/radiobutton';
import { AppButton } from '../button/button-component';
import { ENVIRONMENT, EnvironmentConfig } from '../../../environment.token';
import { BotProtectionService } from '../../services/bot-protection-service';
import { PasswordModule } from 'primeng/password';
import { SignInResponse } from '../../models/auth.models';
import { getMessageFromError } from '../../helpers/utils';
import { SeoService } from '../../services/seo-service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    RadioButton,
    FormsModule,
    RouterLink,
    AppButton,
    PasswordModule
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
  signInType = signal<'admin' | 'participant'>('admin');
  hasGoogleLogin = false;
  hasFacebookLogin = false;

  private usersService = inject(UsersService);
  private messagesService = inject(MessagesService);
  private botProtectionService = inject(BotProtectionService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);
  private seoService = inject(SeoService);
  private document = inject(DOCUMENT);

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

  signInSignUp = computed<string>( () => {
    return `Sign In ${this.isAdmin ? " / Sign Up" : ""}`;
  })

  onRadioClick(_: Event): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.applySeo();
  }

  ngOnInit(): void {
    this.isLoading = false;

    const currentUrl = this.router.url;
    const urlWithoutFragment = currentUrl.split('#')[0];

    const parts = urlWithoutFragment.split('?');
    const path = parts[0];
    const endsWithParticipant = path.endsWith('/participant');  

    this.signInType.set(endsWithParticipant ? 'participant' : 'admin');
    this.applySeo();

    const queryParams = new URLSearchParams(parts[1]);
    let shouldCleanOAuthQueryParams = false;

    if (this.signInType() === 'admin') {
      const email = queryParams.get('email');
      if (email) { 
        this.adminForm.patchValue({ email: email });
      }

      const googleOAuthError = queryParams.get('googleOAuthError');
      if (googleOAuthError) {
        this.errorMessage = googleOAuthError;
        shouldCleanOAuthQueryParams = true;
      }

      const facebookOAuthError = queryParams.get('facebookOAuthError');
      if (facebookOAuthError) {
        this.errorMessage = facebookOAuthError;
        shouldCleanOAuthQueryParams = true;
      }

      const googleOAuthToken = queryParams.get('googleOAuthToken');
      if (googleOAuthToken) {
        shouldCleanOAuthQueryParams = true;
        void this.completeGoogleOAuthSignIn(googleOAuthToken);
      }

      const facebookOAuthToken = queryParams.get('facebookOAuthToken');
      if (facebookOAuthToken) {
        shouldCleanOAuthQueryParams = true;
        void this.completeFacebookOAuthSignIn(facebookOAuthToken);
      }

      if (shouldCleanOAuthQueryParams) {
        queryParams.delete('googleOAuthError');
        queryParams.delete('facebookOAuthError');
        queryParams.delete('googleOAuthToken');
        queryParams.delete('facebookOAuthToken');

        const remaining = queryParams.toString();
        const cleanedUrl = remaining ? `${path}?${remaining}` : path;
        window.history.replaceState(null, '', cleanedUrl);
      }
    }
  }

  @HostListener('window:pageshow', ['$event'])
  onPageShow(event: PageTransitionEvent): void {
    if (event.persisted) {
      this.isLoading = false;
    }
  }

  onEmailChange(e) {
    this.errorMessage = '';
    this.successMessage = '';  
  }

  private applySeo(): void {
    const isParticipant = this.signInType() === 'participant';
    const title = isParticipant ? 'Participant Sign In | Plantour' : 'Sign In | Plantour';
    const description = isParticipant
      ? 'Join your Plantour trip workspace as a participant and collaborate on packing and travel tasks.'
      : 'Sign in to Plantour to manage trips, packing lists, travelers, and shared travel planning.';

    this.seoService.setSeo({
      title,
      description,
      canonicalUrl: this.toAbsoluteUrl(this.router.url.split('?')[0] || '/sign-in'),
      ogType: 'website',
      robots: 'noindex, nofollow, noarchive, nosnippet',
      jsonLd: null,
    });
  }

  private toAbsoluteUrl(path: string): string {
    try {
      return new URL(path, this.document.baseURI).toString();
    } catch {
      return path;
    }
  }

  get isAdmin(): boolean {
    return this.signInType() === 'admin';
  }

  get currentForm(): FormGroup {
    return this.isAdmin ? this.adminForm : this.participantForm;
  }

  get helpUrl(): string {
    return this.isAdmin
      ? '/help/get-started/first-steps'
      : '/help/workflows/invite-travelers';
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

  onSignInWithGoogle(): void {
    if (!this.hasGoogleLogin || !this.isAdmin || this.isLoading) {
      return;
    }

    const path = this.router.url.split('?')[0] || '/sign-in';
    const returnUrl = this.toAbsoluteUrl(path);
    const startUrl = this.usersService.getGoogleOAuthStartUrl(returnUrl);

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    window.location.href = startUrl;
  }

  private async completeGoogleOAuthSignIn(googleOAuthToken: string): Promise<void> {
    if (!googleOAuthToken) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.usersService.completeGoogleOAuthSignIn(googleOAuthToken, null).pipe(
      catchError((error) => {
        const errorMsg = error?.error?.message || 'Google sign in failed. Please try again.';
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
    if (!this.hasFacebookLogin || !this.isAdmin || this.isLoading) {
      this.messagesService.showWarning('Facebook Login', 'Facebook App ID is not configured.');
      return;
    }

    const path = this.router.url.split('?')[0] || '/sign-in';
    const returnUrl = this.toAbsoluteUrl(path);
    const startUrl = this.usersService.getFacebookOAuthStartUrl(returnUrl);

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    window.location.href = startUrl;
  }

  private async completeFacebookOAuthSignIn(facebookOAuthToken: string): Promise<void> {
    if (!facebookOAuthToken) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.usersService.completeFacebookOAuthSignIn(facebookOAuthToken).pipe(
      catchError((error) => {
        const errorMsg = error?.error?.message || 'Facebook sign in failed. Please try again.';
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
