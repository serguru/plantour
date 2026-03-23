import { Component, ElementRef, Inject, inject, OnInit, ViewChild } from '@angular/core';
import { DOCUMENT, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import {
  FacebookLoginProvider,
  SocialAuthService as LibrarySocialAuthService,
  SocialUser,
} from '@abacritt/angularx-social-login';
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
import { SocialAuthService as PlantourSocialAuthService } from '../../services/social-auth-service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    RadioButton,
    FormsModule,
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
  signInType: 'admin' | 'participant' = 'admin';
  hasGoogleLogin = false;
  hasFacebookLogin = false;
  private googleButtonHostElement?: HTMLElement;

  private usersService = inject(UsersService);
  private messagesService = inject(MessagesService);
  private socialAuthService = inject(LibrarySocialAuthService);
  private plantourSocialAuthService = inject(PlantourSocialAuthService);
  private botProtectionService = inject(BotProtectionService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);
  private seoService = inject(SeoService);
  private document = inject(DOCUMENT);

  @ViewChild('googleButtonHost')
  set googleButtonHost(elementRef: ElementRef<HTMLElement> | undefined) {
    this.googleButtonHostElement = elementRef?.nativeElement;

    if (this.googleButtonHostElement) {
      void this.initializeGoogleButton();
    }
  }

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

  onRadioClick(_: Event): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.applySeo();
  }

  ngOnInit(): void {
    const currentUrl = this.router.url; 

    const parts = currentUrl.split('?');
    const path = parts[0];
    const endsWithParticipant = path.endsWith('/participant');  

    this.signInType = endsWithParticipant ? 'participant' : 'admin';
    this.applySeo();

    const queryParams = new URLSearchParams(parts[1]);

    if (this.signInType === 'admin') {
      const email = queryParams.get('email');
      if (email) { 
        this.adminForm.patchValue({ email: email });
      }
    }
  }

  onEmailChange(e) {
    this.errorMessage = '';
    this.successMessage = '';  
  }

  private applySeo(): void {
    const isParticipant = this.signInType === 'participant';
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

  private async initializeGoogleButton(): Promise<void> {
    if (!this.hasGoogleLogin || !this.isAdmin || this.isLoading || !this.googleButtonHostElement || !this.environment.googleClientId) {
      return;
    }

    try {
      await this.plantourSocialAuthService.loadGoogleSdk();
      this.plantourSocialAuthService.renderGoogleButton(
        this.googleButtonHostElement,
        this.environment.googleClientId,
        this.onGoogleCredential
      );
    } catch (error) {
      console.error('Google Identity Services initialization failed', error);
    }
  }

  private onGoogleCredential = (idToken: string): void => {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;
    void this.signInWithSocial('google', idToken);
  };

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

      if (this.isFacebookLoginCancelled(error)) {
        return;
      }

      const errorMsg = this.getFacebookLoginErrorMessage(error);
      this.errorMessage = errorMsg;
      this.messagesService.showError('Sign In Failed', errorMsg);
    }
  }

  private isFacebookLoginCancelled(error: any): boolean {
    const rawMessage = typeof error === 'string'
      ? error
      : error?.message || '';

    if (!rawMessage) {
      return false;
    }

    const normalizedMessage = rawMessage.toLowerCase();

    return normalizedMessage.includes('cancel')
      || normalizedMessage.includes('cancell')
      || normalizedMessage.includes('popup_closed_by_user')
      || normalizedMessage.includes('closed by user')
      || normalizedMessage.includes('user closed')
      || normalizedMessage.includes('closed before completing');
  }

  private getFacebookLoginErrorMessage(error: any): string {
    const rawMessage = typeof error === 'string'
      ? error
      : error?.message || '';

    if (rawMessage.includes('JSSDK Option is Not Toggled')) {
      return 'Facebook Login is not fully configured for this site. In Meta for Developers enable Login with the JavaScript SDK and add the QA domain to Allowed Domains for the JavaScript SDK.';
    }

    if (rawMessage.includes('Given URL is not allowed by the Application configuration')) {
      return 'Facebook Login is not configured for this site URL. Add the QA site URL and domain in the Meta Facebook Login settings.';
    }

    return rawMessage || 'Facebook sign in failed. Please try again.';
  }

  private async completeSocialSignInFromUser(
    provider: 'facebook',
    user: SocialUser,
    providerName: string
  ): Promise<void> {
    const token = user.authToken;

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
