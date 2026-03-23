import { Component, Inject, computed, inject, OnInit, signal } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { catchError, finalize, EMPTY } from 'rxjs';
import { ScheduledPlanDowngradeInfoDto, UsersService, UserDto } from '../../../../services/users-service';
import { MessagesService } from '../../../../services/messages-service';
import { AppButton } from '../../../button/button-component';
import { SocialAuthService } from '../../../../services/social-auth-service';
import { ENVIRONMENT, EnvironmentConfig } from '../../../../../environment.token';
import { PaddleService } from '../../../../services/paddle-service';
import { firstValueFrom } from 'rxjs';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PopoverModule,
    AppButton
],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.scss',
})
export class ProfileComponent implements OnInit {
  componentId = 'profile';
  hasGoogleLinked = signal(false);
  hasFacebookLinked = signal(false);
  isGoogleBusy = signal(false);
  isFacebookBusy = signal(false);
  expandedSections = signal<Record<string, boolean>>({
    'personal-information': true,
    'social-login': false
  });
  
  profileData = signal<UserDto | null>(null);
  profileForm: FormGroup;
  isLoadingProfile = signal(false);
  isUpdatingProfile = signal(false);
  isOpeningPortal = signal(false);
  isLoadingScheduledDowngrade = signal(false);
  isCancellingScheduledDowngrade = signal(false);
  scheduledDowngrade = signal<ScheduledPlanDowngradeInfoDto | null>(null);

  public usersService = inject(UsersService);
  private messagesService = inject(MessagesService);
  private socialAuthService = inject(SocialAuthService);
  private paddleService = inject(PaddleService);
  private fb = inject(FormBuilder);

  router = inject(Router);

  currentUser = this.usersService.userSignal;

  expiresAt = this.usersService.tokenExpiredAtSignal;

  isAdmin = this.usersService.isAdminSignal;
  
  isTemporary = this.usersService.isTemporarySignal;
  
  planPeriod = this.usersService.planPeriodSignal;

  

  fullName = computed(() => {
    //const user = this.currentUser();
    if (!this.profileData()) {
      return '';
    }

    const fullName = `${this.profileData()!.firstName ?? ''} ${this.profileData()!.lastName ?? ''}`.trim();
    return fullName || this.profileData()!.email || '';
  });

  participantCode = computed(() => {
    if (!this.profileData()) {
      return '';
    }
    return this.profileData()?.participantCode;
  });
  showParticipantCode = signal(false);
  toggleShowParticipantCode = () => {
    this.showParticipantCode.set(!this.showParticipantCode())
  }


  userEmail = computed(() => this.profileData()?.email ?? '');

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

        this.profileData.set(profile);

        this.hasGoogleLinked.set(profile.hasGoogleLinked);
        this.hasFacebookLinked.set(profile.hasFacebookLinked);

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

  // onConnectGoogle(): void {
  //   if (!this.environment.googleClientId) {
  //     this.messagesService.showWarning('Google Login', 'Google Client ID is not configured.');
  //     return;
  //   }

  //   this.isGoogleBusy.set(true);

  //   this.socialAuthService.loadGoogleSdk()
  //     .then(() => {
  //       const googleSdk = (window as any).google;

  //       googleSdk.accounts.id.initialize({
  //         client_id: this.environment.googleClientId!,
  //         use_fedcm_for_button: true,
  //         callback: (response: { credential?: string }) => {
  //           const idToken = response?.credential;
  //           if (!idToken) {
  //             this.isGoogleBusy.set(false);
  //             this.messagesService.showWarning('Google Login', 'Google authentication was cancelled.');
  //             return;
  //           }

  //           this.usersService.linkSocialProvider('google', idToken).pipe(
  //             catchError((error) => {
  //               const errorMsg = error.error?.message || 'Failed to link Google account.';
  //               this.messagesService.showError('Google Link Failed', errorMsg);
  //               return EMPTY;
  //             }),
  //             finalize(() => this.isGoogleBusy.set(false))
  //           ).subscribe({
  //             next: (profile: UserDto) => {
  //               this.hasGoogleLinked.set(profile.hasGoogleLinked);
  //               this.messagesService.showInfo('Google Linked', 'Google login has been connected to your account.');
  //             }
  //           });
  //         }
  //       });

  //       googleSdk.accounts.id.prompt();
  //     })
  //     .catch(() => {
  //       this.isGoogleBusy.set(false);
  //       this.messagesService.showWarning('Google Login', 'Google SDK failed to load.');
  //     });
  // }

  // onResetGoogle(): void {
  //   this.isGoogleBusy.set(true);

  //   this.usersService.unlinkSocialProvider('google').pipe(
  //     catchError((error) => {
  //       const errorMsg = error.error?.message || 'Failed to disconnect Google login.';
  //       this.messagesService.showError('Google Reset Failed', errorMsg);
  //       return EMPTY;
  //     }),
  //     finalize(() => this.isGoogleBusy.set(false))
  //   ).subscribe({
  //     next: (profile: UserDto) => {
  //       this.hasGoogleLinked.set(profile.hasGoogleLinked);
  //       this.messagesService.showInfo('Google Disconnected', 'Google login has been disconnected.');
  //     }
  //   });
  // }

  // async onConnectFacebook(): Promise<void> {
  //   if (!this.environment.facebookAppId) {
  //     this.messagesService.showWarning('Facebook Login', 'Facebook App ID is not configured.');
  //     return;
  //   }

  //   this.isFacebookBusy.set(true);

  //   try {
  //     await this.socialAuthService.loadFacebookSdk(this.environment.facebookAppId);
  //     const accessToken = await this.socialAuthService.loginWithFacebook();

  //     this.usersService.linkSocialProvider('facebook', accessToken).pipe(
  //       catchError((error) => {
  //         const errorMsg = error.error?.message || 'Failed to link Facebook account.';
  //         this.messagesService.showError('Facebook Link Failed', errorMsg);
  //         return EMPTY;
  //       }),
  //       finalize(() => this.isFacebookBusy.set(false))
  //     ).subscribe({
  //       next: (profile: UserDto) => {
  //         this.hasFacebookLinked.set(profile.hasFacebookLinked);
  //         this.messagesService.showInfo('Facebook Linked', 'Facebook login has been connected to your account.');
  //       }
  //     });
  //   } catch (error: any) {
  //     this.isFacebookBusy.set(false);
  //     const errorMsg = error?.message || 'Facebook authentication failed. Please try again.';
  //     this.messagesService.showError('Facebook Login Failed', errorMsg);
  //   }
  // }

  // onResetFacebook(): void {
  //   this.isFacebookBusy.set(true);

  //   this.usersService.unlinkSocialProvider('facebook').pipe(
  //     catchError((error) => {
  //       const errorMsg = error.error?.message || 'Failed to disconnect Facebook login.';
  //       this.messagesService.showError('Facebook Reset Failed', errorMsg);
  //       return EMPTY;
  //     }),
  //     finalize(() => this.isFacebookBusy.set(false))
  //   ).subscribe({
  //     next: (profile: UserDto) => {
  //       this.hasFacebookLinked.set(profile.hasFacebookLinked);
  //       this.messagesService.showInfo('Facebook Disconnected', 'Facebook login has been disconnected.');
  //     }
  //   });
  // }

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
      next: (response: any) => {
        if (response.redirectToSignin) {
          this.messagesService.showInfo('Account changed', `Your account has been changed. Please sign-in with your email ${email}.`);
          this.usersService.signOut();
          this.router.navigate(['/sign-in']);
          return;
        }
        this.messagesService.showInfo('Profile Updated', 'Your profile has been successfully updated.');
        this.profileForm.patchValue({
          email: response.updatedProfile.email,
          firstName: response.updatedProfile.firstName || '',
          lastName: response.updatedProfile.lastName || '',
          phone: response.updatedProfile.phone || ''
        });
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

  isProfileFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  onChoosePlanClick(): void {
    this.router.navigate(['/plans']);
  }
  onManageBillingClick(): void {
    if (this.isTemporary()) {
      return;
    }
    this.onOpenCustomerPortal();
  }


  
}


