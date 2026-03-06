import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { UsersService } from '../../services/users-service';
import { MessagesService } from '../../services/messages-service';
import { ButtonModule } from 'primeng/button';
import { AppButton } from '../button/button-component';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, ButtonModule, AppButton],
  templateUrl: './confirm-email.html',
  styleUrl: './confirm-email.scss',
})
export class ConfirmEmailComponent implements OnInit {
  isLoading = false;
  confirmed = false;
  errorMessage = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usersService = inject(UsersService);
  private messagesService = inject(MessagesService);

  showSignIn = false;
  showSignUp = false;

  ngOnInit(): void {
    const userId = this.route.snapshot.queryParamMap.get('userId');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!userId || !token) {
      this.errorMessage = 'Invalid confirmation link';
      return;
    }

    this.isLoading = true;
    this.usersService.confirmEmail(userId, token).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (result) => {
        this.confirmed = result.confirmed === true;
        if (this.confirmed) {
          this.messagesService.showInfo('Email confirmed', 'You can now sign in.');
          this.showSignIn = true;
        } else {
          this.errorMessage = 'SignIn failed. The link may be expired. Please try to sign up one more time.';
          this.showSignUp = true;
        }
      },
      error: () => {
        this.errorMessage = 'SignIn failed. The link may be expired. Please try to sign up one more time.';
        this.showSignUp = true;
      }
    });
  }

  goToSignIn(): void {
    this.router.navigate(['/sign-in']);
  }

  goToSignUp(): void {
    this.router.navigate(['/sign-up']);
  }
}
