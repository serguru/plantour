import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { UsersService, MessagesService } from 'shared-lib';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { ToolbarAware } from '../toolbar-aware';
import { ContentLayoutComponent } from '../layouts/content-layout.component';
import { PageWrapper } from '../page-wrapper/page-wrapper';
import { ControlsWrapper } from '../page-wrapper/controls-wrapper/controls-wrapper';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ContentLayoutComponent,
    PageWrapper,
    ControlsWrapper
  ],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignInComponent extends ToolbarAware {
  signInForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  private usersService = inject(UsersService);
  private messagesService = inject(MessagesService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);

  constructor() {
    super();
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      this.messagesService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.signInForm.value;

    this.usersService.loginAdmin(email, password).pipe(
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
      next: () => {
        this.messagesService.showInfo('Sign In Successful', 'Welcome back!');
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

  onRegister(): void {
    this.router.navigate(['/register']);
  }

  getFieldError(fieldName: string): string {
    const field = this.signInForm.get(fieldName);
    if (!field || !field.touched) return '';

    if (field.hasError('required')) {
      return 'This field is required';
    }
    if (field.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `Password must be at least ${minLength} characters`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signInForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
