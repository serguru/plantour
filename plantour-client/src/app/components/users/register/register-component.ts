import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { UsersService } from '../../../services/users-service';
import { catchError, finalize } from 'rxjs';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule
  ],
  templateUrl: './register-component.html',
  styleUrl: './register-component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private router = inject(Router);

  form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: [''],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    },
    { validators: this.passwordsMatch }
  );

  passwordsMatch(group: any) {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p === c ? null : { mismatch: true };
  }

  registering = signal(false);

  submit() {
    if (this.form.invalid) return;
    this.registering.set(true);

    const metadata = {
        first_name: this.form.value.firstName!,
        last_name: this.form.value.lastName!,
        phone: this.form.value.phone!,
    }

    this.usersService
      .register({
        email: this.form.value.email!,
        password: this.form.value.password!,
        metadata: metadata
      })
      .pipe(
        catchError(e => {
          throw new Error(e);
        }),
        finalize(() => 
          this.registering.set(false)
        )
      )
      .subscribe(() => {
        this.router.navigateByUrl('/login');
      });
  }
}
