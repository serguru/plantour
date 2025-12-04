import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { UsersService, MessagesService } from 'shared-lib';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
import { ToolbarAware } from '../toolbar-aware';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule
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
      email: ['serguru@gmail.com', [Validators.required, Validators.email]],
      password: ['Binary_09', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const email = this.signInForm.value.email;
    const password = this.signInForm.value.password;

    this.usersService.loginAdmin(email, password).pipe(
      catchError((error) => {
        this.errorMessage = error.error?.message || 'Sign in failed. Please try again.';
        //console.error('Sign in error:', error);
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (result) => {
        this.router.navigate(['']);
        this.messagesService.showInfo('Sign in successful', 'Welcome back!');
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
    if (field?.hasError('required') && field?.touched) {
      return 'This field is required';
    }
    if (field?.hasError('email') && field?.touched) {
      return 'Please enter a valid email';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signInForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
