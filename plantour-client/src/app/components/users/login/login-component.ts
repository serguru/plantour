import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersService } from '../../../services/users-service';
import { Router } from '@angular/router';
// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { Password, PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { catchError, finalize, tap } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    MessageModule,
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private router = inject(Router);

  submitting = signal(false);
  errorMessage = signal('');

  form = this.fb.group({
    email: ['weblinksapp@gmail.com', [Validators.required, Validators.email]],
    password: ['Binary_09', Validators.required],
  });

  submit() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const { email, password } = this.form.value;

    this.usersService.login(email!, password!)
      .pipe(
        finalize(() => {
          this.submitting.set(false);
        })
      )
      .subscribe(r => {
        //this.router.navigateByUrl('/');
      });
  }





}
