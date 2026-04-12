import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { UsersService } from '../services/users-service';

@Component({
  selector: 'app-sign-in-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in-page.html',
  styleUrl: './sign-in-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly signInForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor() {
    if (this.usersService.isAuthenticated()) {
      void this.router.navigate(['/']);
    }
  }

  protected submitSignIn(): void {
    if (this.signInForm.invalid || this.isSubmitting()) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.usersService.signIn(this.signInForm.getRawValue()).pipe(
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: () => {
        void this.router.navigate(['/']);
      },
      error: (error) => {
        this.errorMessage.set(this.usersService.getErrorMessage(error));
      }
    });
  }
}
