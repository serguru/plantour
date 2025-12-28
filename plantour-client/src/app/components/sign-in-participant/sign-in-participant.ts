import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { ContentLayoutComponent } from '../layouts/content-layout.component';
import { UsersService } from '../../services/users-service';
import { MessagesService } from '../../services/messages-service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ContentLayoutComponent
  ],
  templateUrl: './sign-in-participant.html',
  styleUrl: './sign-in-participant.scss',
})
export class SignInParticipantComponent {
  componentId = 'sign-in-participant';
  signInForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  private usersService = inject(UsersService);
  private messagesService = inject(MessagesService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);

  constructor() {
    this.signInForm = this.fb.group({
      accessCode: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      this.messagesService.showWarning('Validation Error', 'Access Code is required.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { accessCode } = this.signInForm.value;

    this.usersService.loginParticipant(accessCode).pipe(
      catchError((error) => {
        const errorMsg = error.error?.message || 'Participant sign in failed. Please check your Access Code and try again.';
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

  getFieldError(fieldName: string): string {
    const field = this.signInForm.get(fieldName);
    if (!field || !field.touched) return '';

    if (field.hasError('required')) {
      return 'This field is required';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signInForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  onSignUp(): void {
    this.router.navigate(['/sign-up-']);
  }

}
