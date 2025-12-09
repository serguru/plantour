import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { ToolbarAware } from '../toolbar-aware';
import { ContentLayoutComponent } from '../layouts/content-layout.component';
import { ControlsWrapper } from '../page-wrapper/controls-wrapper/controls-wrapper';
import { UsersService } from '../../services/users-service';
import { MessagesService } from '../../services/messages-service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ContentLayoutComponent,
    ControlsWrapper
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUpComponent extends ToolbarAware {
  signUpForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  private usersService = inject(UsersService);
  private messagesService = inject(MessagesService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);

  constructor() {
    super();
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
        this.messagesService.showInfo('Sign Up Successful', 'Welcome!');
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

}
