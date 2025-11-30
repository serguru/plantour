import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { UsersService, SignUpRequest } from 'shared-lib';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule
  ],
  templateUrl: './register-user.html',
  styleUrl: './register-user.scss',
})
export class RegisterUserComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);

  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const signUpData: SignUpRequest = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      firstName: this.registerForm.value.firstName || undefined,
      lastName: this.registerForm.value.lastName || undefined
    };

    this.usersService.registerAdmin(signUpData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        console.error('Registration error:', error);
      }
    });
  }

  onBack(): void {
    this.location.back();
  }

  onLogoClick(): void {
    this.router.navigate(['']);
  }

  onSignIn(): void {
    // TODO: Navigate to sign in page when implemented
    console.log('Navigate to sign in page');
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.hasError('required') && field?.touched) {
      return 'This field is required';
    }
    if (field?.hasError('email') && field?.touched) {
      return 'Please enter a valid email';
    }
    return '';
  }

  getConfirmPasswordError(): string {
    const confirmPassword = this.registerForm.get('confirmPassword');
    if (confirmPassword?.hasError('required') && confirmPassword?.touched) {
      return 'This field is required';
    }
    if (this.registerForm.hasError('passwordMismatch') && confirmPassword?.touched) {
      return 'Passwords do not match';
    }
    return '';
  }

  isConfirmPasswordInvalid(): boolean {
    const confirmPassword = this.registerForm.get('confirmPassword');
    return !!(confirmPassword && confirmPassword.touched && 
      (confirmPassword.invalid || this.registerForm.hasError('passwordMismatch')));
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
