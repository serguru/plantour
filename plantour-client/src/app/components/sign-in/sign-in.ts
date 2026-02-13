import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { UsersService } from '../../services/users-service';
import { MessagesService } from '../../services/messages-service';
import { RadioButton } from 'primeng/radiobutton';
import { AppButton } from '../button/button-component';
import { ENVIRONMENT, EnvironmentConfig } from '../../../environment.token';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    RadioButton,
    FormsModule,
    AppButton
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
  signInType: 'admin' | 'participant' = 'admin';

  private usersService = inject(UsersService);
  private messagesService = inject(MessagesService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);

  constructor(
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {

    let e = "";
    let p = "";

    if (this.environment.environment === 'development') {
      e = 'serguru@gmail.com';
      p = "Binary_09"
    }

    this.adminForm = this.fb.group({
      email: [e, [Validators.required, Validators.email]],
      password: [p, [Validators.required]],
    });
    this.participantForm = this.fb.group({
      accessCode: ['', [Validators.required]],
    });
  }
  ngOnInit(): void {
    const currentUrl = this.router.url; 
    const endsWithParticipant = currentUrl.split('?')[0].endsWith('/participant');    
    this.signInType = endsWithParticipant ? 'participant' : 'admin';
  }

  get isAdmin(): boolean {
    return this.signInType === 'admin';
  }

  get currentForm(): FormGroup {
    return this.isAdmin ? this.adminForm : this.participantForm;
  }

  onSubmit(): void {
    if (this.currentForm.invalid) {
      this.currentForm.markAllAsTouched();
      this.messagesService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isAdmin) {

      const { email, password } = this.currentForm.value;
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
        next: (response) => {
          const message = response?.message || 'Welcome back to Plantour';
          this.messagesService.showInfo('Sign In Successful', message);
          this.router.navigate(['']);
        }
      });
      return;
    }


    const { accessCode } = this.currentForm.value;

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
      next: (response) => {
        const message = response?.message || 'Welcome back to Plantour';
        this.messagesService.showInfo('Sign In Successful', message);
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

  onSignUp(): void {
    this.router.navigate(['/sign-up']);
  }

}
