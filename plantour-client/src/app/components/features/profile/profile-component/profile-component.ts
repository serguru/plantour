import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { catchError, finalize, EMPTY } from 'rxjs';
import { UsersService, UserDto } from '../../../../services/users-service';
import { MessagesService } from '../../../../services/messages-service';
import { AppButton } from '../../../button/button-component';
import { PortalSessionResponseDto, StripeService } from '../../../../services/stripe-service';

// TODO: move c hange password form to a separate component and use it in both profile and auth pages
// TODO: add styles to custom portal link
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
  customerPortalUrl = signal<string | null>(null);

  profileForm: FormGroup;
  passwordForm: FormGroup;
  isLoadingProfile = signal(false);
  isUpdatingProfile = signal(false);
  isUpdatingPassword = signal(false);

  private usersService = inject(UsersService);
  private messagesService = inject(MessagesService);
  private stripeService = inject(StripeService);
  private fb = inject(FormBuilder);

  constructor() {
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
    this.stripeService.getCustomerPortalUrl().subscribe({
      next: (response: PortalSessionResponseDto) => {
        this.customerPortalUrl.set(response.url); 
      }
    }); 

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
        this.profileForm.patchValue({
          email: profile.email,
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          phone: profile.phone || ''
        });
      }
    });
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

    this.usersService.updatePassword(currentPassword, newPassword).pipe(
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

}


