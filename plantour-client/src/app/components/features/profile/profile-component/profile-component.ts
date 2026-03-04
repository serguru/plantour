import { Component, Inject, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { catchError, finalize, EMPTY } from 'rxjs';
import { ScheduledPlanDowngradeInfoDto, UsersService, UserDto } from '../../../../services/users-service';
import { MessagesService } from '../../../../services/messages-service';
import { AppButton } from '../../../button/button-component';
import { SocialAuthService } from '../../../../services/social-auth-service';
import { ENVIRONMENT, EnvironmentConfig } from '../../../../../environment.token';
import { PaddleService } from '../../../../services/paddle-service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

// TODO: move c hange password form to a separate component and use it in both profile and auth pages
// TODO: add styles to custom portal link
// TODO: check social logins section logic
// TODO: find out how to show local prices to customers with Paddle
@Component({
  selector: 'app-profile-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    AppButton
  ],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.scss',
})
export class ProfileComponent implements OnInit {
  componentId = 'profile';
  hasPassword = signal(true);
  hasGoogleLinked = signal(false);
  hasFacebookLinked = signal(false);
  isGoogleBusy = signal(false);
  isFacebookBusy = signal(false);
  expandedSections = signal<Record<string, boolean>>({
    'personal-information': true,
    'social-login': false,
    'change-password': false,
  });

  profileForm: FormGroup;
  passwordForm: FormGroup;
  isLoadingProfile = signal(false);
  isUpdatingProfile = signal(false);
  isUpdatingPassword = signal(false);
  isOpeningPortal = signal(false);
  isLoadingScheduledDowngrade = signal(false);
  isCancellingScheduledDowngrade = signal(false);
  scheduledDowngrade = signal<ScheduledPlanDowngradeInfoDto | null>(null);

  private usersService = inject(UsersService);
  private messagesService = inject(MessagesService);
  private socialAuthService = inject(SocialAuthService);
  private paddleService = inject(PaddleService);
  private fb = inject(FormBuilder);

  router = inject(Router);

  currentUser = this.usersService.userSignal;

  isAdmin = this.usersService.isAdminSignal;

  planPeriod = this.usersService.planPeriodSignal;

  fullName = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return '';
    }

    const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
    return fullName || user.email || '';
  });
  userEmail = computed(() => this.currentUser()?.email ?? '');

  userRole = computed(() => {
    const role = this.usersService.getRole();
    return role === 'Admin' || role === 'Participant' ? role : '';
  });

  constructor(
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      phone: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadProfile();

    if (this.isAdmin()) {
      this.loadScheduledDowngrade();
    }

  }

  toggleSection(sectionId: string): void {
    this.expandedSections.update((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  }

  isSectionExpanded(sectionId: string): boolean {
    return !!this.expandedSections()[sectionId];
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmNewPassword = control.get('confirmNewPassword');

    if (!newPassword || !confirmNewPassword) {
      return null;
    }

    return newPassword.value === confirmNewPassword.value ? null : { passwordMismatch: true };
  }

  loadProfile(): void {
    this.isLoadingProfile.set(true);

    this.usersService.getProfile().pipe(
      catchError((error) => {
        const errorMsg = error.error?.message || 'Failed to load profile. Please try again.';
        this.messagesService.showError('Load Failed', errorMsg);
        return EMPTY;
      }),
      finalize(() => {
        this.isLoadingProfile.set(false);
      })
    ).subscribe({
      next: (profile: UserDto) => {
        this.hasPassword.set(profile.hasPassword);
        this.hasGoogleLinked.set(profile.hasGoogleLinked);
        this.hasFacebookLinked.set(profile.hasFacebookLinked);

        const currentPasswordControl = this.passwordForm.get('currentPassword');
        if (this.hasPassword()) {
          currentPasswordControl?.setValidators([Validators.required]);
        } else {
          currentPasswordControl?.clearValidators();
          currentPasswordControl?.setValue('');
        }
        currentPasswordControl?.updateValueAndValidity();

        this.profileForm.patchValue({
          email: profile.email,
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          phone: profile.phone || ''
        });

        if (this.isAdmin()) {
          this.loadScheduledDowngrade();
        }
      }
    });
  }

  loadScheduledDowngrade(): void {
    if (!this.isAdmin()) {
      this.scheduledDowngrade.set(null);
      return;
    }

    this.isLoadingScheduledDowngrade.set(true);

    this.usersService.getScheduledDowngrade().pipe(
      catchError((error) => {
        const errorMsg = error.error?.message || 'Failed to load scheduled downgrade info.';
        this.messagesService.showError('Load Failed', errorMsg);
        return EMPTY;
      }),
      finalize(() => {
        this.isLoadingScheduledDowngrade.set(false);
      })
    ).subscribe({
      next: (info) => {
        this.scheduledDowngrade.set(info);
      }
    });
  }

  onCancelScheduledDowngrade(event: Event): void {
    event.preventDefault();

    if (this.isCancellingScheduledDowngrade()) {
      return;
    }

    this.isCancellingScheduledDowngrade.set(true);

    this.usersService.cancelScheduledDowngrade().pipe(
      catchError((error) => {
        const errorMsg = error.error?.message || 'Failed to cancel scheduled downgrade.';
        this.messagesService.showError('Cancel Failed', errorMsg);
        return EMPTY;
      }),
      finalize(() => {
        this.isCancellingScheduledDowngrade.set(false);
      })
    ).subscribe({
      next: (response) => {
        if (response?.cancelled) {
          this.messagesService.showInfo('Scheduled Downgrade', 'Scheduled downgrade has been cancelled.');
        } else {
          this.messagesService.showWarning('Scheduled Downgrade', 'No scheduled downgrade found.');
        }
        this.loadScheduledDowngrade();
      }
    });
  }

  formatScheduledDowngrade(info: ScheduledPlanDowngradeInfoDto | null): string {
    if (!info?.hasScheduledDowngrade) {
      return 'None';
    }

    const targetPlan = info.newPlanPrice || 'selected plan';
    const executionDate = info.executionTime ? new Date(info.executionTime).toLocaleString() : 'scheduled time';

    return `To ${targetPlan} at ${executionDate}`;
  }

  onConnectGoogle(): void {
    if (!this.environment.googleClientId) {
      this.messagesService.showWarning('Google Login', 'Google Client ID is not configured.');
      return;
    }

    this.isGoogleBusy.set(true);

    this.socialAuthService.loadGoogleSdk()
      .then(() => {
        const googleSdk = (window as any).google;

        googleSdk.accounts.id.initialize({
          client_id: this.environment.googleClientId!,
          use_fedcm_for_button: true,
          callback: (response: { credential?: string }) => {
            const idToken = response?.credential;
            if (!idToken) {
              this.isGoogleBusy.set(false);
              this.messagesService.showWarning('Google Login', 'Google authentication was cancelled.');
              return;
            }

            this.usersService.linkSocialProvider('google', idToken).pipe(
              catchError((error) => {
                const errorMsg = error.error?.message || 'Failed to link Google account.';
                this.messagesService.showError('Google Link Failed', errorMsg);
                return EMPTY;
              }),
              finalize(() => this.isGoogleBusy.set(false))
            ).subscribe({
              next: (profile: UserDto) => {
                this.hasGoogleLinked.set(profile.hasGoogleLinked);
                this.messagesService.showInfo('Google Linked', 'Google login has been connected to your account.');
              }
            });
          }
        });

        googleSdk.accounts.id.prompt();
      })
      .catch(() => {
        this.isGoogleBusy.set(false);
        this.messagesService.showWarning('Google Login', 'Google SDK failed to load.');
      });
  }

  onResetGoogle(): void {
    this.isGoogleBusy.set(true);

    this.usersService.unlinkSocialProvider('google').pipe(
      catchError((error) => {
        const errorMsg = error.error?.message || 'Failed to disconnect Google login.';
        this.messagesService.showError('Google Reset Failed', errorMsg);
        return EMPTY;
      }),
      finalize(() => this.isGoogleBusy.set(false))
    ).subscribe({
      next: (profile: UserDto) => {
        this.hasGoogleLinked.set(profile.hasGoogleLinked);
        this.messagesService.showInfo('Google Disconnected', 'Google login has been disconnected.');
      }
    });
  }

  async onConnectFacebook(): Promise<void> {
    if (!this.environment.facebookAppId) {
      this.messagesService.showWarning('Facebook Login', 'Facebook App ID is not configured.');
      return;
    }

    this.isFacebookBusy.set(true);

    try {
      await this.socialAuthService.loadFacebookSdk(this.environment.facebookAppId);
      const accessToken = await this.socialAuthService.loginWithFacebook();

      this.usersService.linkSocialProvider('facebook', accessToken).pipe(
        catchError((error) => {
          const errorMsg = error.error?.message || 'Failed to link Facebook account.';
          this.messagesService.showError('Facebook Link Failed', errorMsg);
          return EMPTY;
        }),
        finalize(() => this.isFacebookBusy.set(false))
      ).subscribe({
        next: (profile: UserDto) => {
          this.hasFacebookLinked.set(profile.hasFacebookLinked);
          this.messagesService.showInfo('Facebook Linked', 'Facebook login has been connected to your account.');
        }
      });
    } catch (error: any) {
      this.isFacebookBusy.set(false);
      const errorMsg = error?.message || 'Facebook authentication failed. Please try again.';
      this.messagesService.showError('Facebook Login Failed', errorMsg);
    }
  }

  onResetFacebook(): void {
    this.isFacebookBusy.set(true);

    this.usersService.unlinkSocialProvider('facebook').pipe(
      catchError((error) => {
        const errorMsg = error.error?.message || 'Failed to disconnect Facebook login.';
        this.messagesService.showError('Facebook Reset Failed', errorMsg);
        return EMPTY;
      }),
      finalize(() => this.isFacebookBusy.set(false))
    ).subscribe({
      next: (profile: UserDto) => {
        this.hasFacebookLinked.set(profile.hasFacebookLinked);
        this.messagesService.showInfo('Facebook Disconnected', 'Facebook login has been disconnected.');
      }
    });
  }

  async onOpenCustomerPortal(): Promise<void> {

    if (this.isOpeningPortal()) {
      return;
    }

    this.isOpeningPortal.set(true);

    try {
      const response = await firstValueFrom(this.paddleService.createCustomerPortalSession());

      if (!response?.url) {
        this.messagesService.showError('Billing', 'Could not create customer portal session. Please try again.');
        return;
      }

      window.location.assign(response.url);
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Failed to open customer portal.';
      this.messagesService.showError('Billing', errorMessage);
    } finally {
      this.isOpeningPortal.set(false);
    }
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.messagesService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.isUpdatingProfile.set(true);

    const { email, firstName, lastName, phone } = this.profileForm.value;

    this.usersService.updateProfile({ email, firstName, lastName, phone }).pipe(
      catchError((error) => {
        const errorMsg = error.error?.message || 'Failed to update profile. Please try again.';
        this.messagesService.showError('Update Failed', errorMsg);
        return EMPTY;
      }),
      finalize(() => {
        this.isUpdatingProfile.set(false);
      })
    ).subscribe({
      next: (updatedProfile: UserDto) => {
        this.messagesService.showInfo('Profile Updated', 'Your profile has been successfully updated.');
        this.profileForm.patchValue({
          email: updatedProfile.email,
          firstName: updatedProfile.firstName || '',
          lastName: updatedProfile.lastName || '',
          phone: updatedProfile.phone || ''
        });
      }
    });
  }

  onUpdatePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.messagesService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.isUpdatingPassword.set(true);

    const { currentPassword, newPassword } = this.passwordForm.value;

    const effectiveCurrentPassword = this.hasPassword() ? currentPassword : '';

    this.usersService.updatePassword(effectiveCurrentPassword, newPassword).pipe(
      catchError((error) => {
        // Check if the error is due to incorrect current password
        const errorMessage = error.error?.message || '';
        const isIncorrectPassword = errorMessage.toLowerCase().includes('current password is incorrect')
          || errorMessage.toLowerCase().includes('wrong password')
          || error.status === 401;

        if (isIncorrectPassword) {
          this.messagesService.showWarning('Invalid Password', 'Please enter a valid current password');
        } else {
          const errorMsg = error.error?.message || 'Failed to update password. Please try again.';
          this.messagesService.showError('Update Failed', errorMsg);
        }
        return EMPTY;
      }),
      finalize(() => {
        this.isUpdatingPassword.set(false);
      })
    ).subscribe({
      next: () => {
        this.messagesService.showInfo('Password Updated', 'Your password has been successfully updated.');
        this.passwordForm.reset();
      }
    });
  }

  getProfileFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (!field || !field.touched) return '';

    if (field.hasError('required')) {
      return 'This field is required';
    }
    if (field.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  getPasswordFieldError(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    if (!field || !field.touched) return '';

    if (field.hasError('required')) {
      return 'This field is required';
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `Password must be at least ${minLength} characters`;
    }
    return '';
  }

  getConfirmNewPasswordError(): string {
    const field = this.passwordForm.get('confirmNewPassword');
    if (!field || !field.touched) return '';

    if (field.hasError('required')) {
      return 'This field is required';
    }
    if (this.passwordForm.hasError('passwordMismatch') && field.touched) {
      return 'Passwords do not match';
    }
    return '';
  }

  isProfileFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  isPasswordFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  isConfirmNewPasswordInvalid(): boolean {
    const field = this.passwordForm.get('confirmNewPassword');
    return !!(field && field.touched && (field.invalid || this.passwordForm.hasError('passwordMismatch')));
  }

  onChoosePlanClick(): void {
    this.router.navigate(['/plans']);
  }
  onManageBillingClick(): void {
    this.onOpenCustomerPortal();
  }


  // <p class="billing-row">
  //     Manage your <a
  //         href=""
  //         (click)="onOpenCustomerPortal($event)"
  //         [attr.aria-disabled]="isOpeningPortal()"
  //         [attr.tabindex]="isOpeningPortal() ? -1 : null"
  //     >{{ isOpeningPortal() ? 'billing portal (opening...)' : 'billing, plan and subscription' }}</a>
  // </p>




}


