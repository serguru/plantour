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
  selector: 'app-login-participant',
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
  templateUrl: './login-participant-component.html',
  styleUrl: './login-participant-component.scss',
})
export class LoginParticipantComponent {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private router = inject(Router);

  submitting = signal(false);
  errorMessage = signal('');

  form = this.fb.group({
    accessCode: ['QBJ3XM9L', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],  
  });

  submit() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const { accessCode } = this.form.value;

    this.usersService.loginParticipant(accessCode!)
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
