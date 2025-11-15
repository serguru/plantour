
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../../../services/users-service';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
  ],
})
export class LoginComponent implements OnInit {

  form: any;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private users: UsersService,
    private router: Router
  ) { }
  
  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }


  submit() {
    if (this.form.invalid) return;

    this.loading = true;

    const { email, password } = this.form.value;

    this.users.login(email!, password!).subscribe({
      next: (token) => {
        localStorage.setItem('jwt', token);
        this.router.navigate(['/']);
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
