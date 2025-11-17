import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersService } from '../../../services/users-service';
import { Router } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    MessageModule
  ],
  templateUrl: './register-component.html',
  styleUrls: ['./register-component.scss']
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  users = inject(UsersService);
  router = inject(Router);

  submitting = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    phone: ['', Validators.required],
    password: ['', Validators.required],
    confirm_password: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) return;
    if (this.form.value.password !== this.form.value.confirm_password) {
      return;
    }
    this.submitting.set(true);
    this.users.register(this.form.value)
      .pipe(
        finalize(() => this.submitting.set(false))
      )
      .subscribe(() => {
        // this.router.navigateByUrl('/login');
      });
  }
}
