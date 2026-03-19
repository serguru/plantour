import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { UsersService } from '../../services/users-service';
import { MessagesService } from '../../services/messages-service';
import { ButtonModule } from 'primeng/button';
import { AppButton } from '../button/button-component';
import { SeoService } from '../../services/seo-service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, ButtonModule, AppButton],
  templateUrl: './signin-token.html',
  styleUrl: './signin-token.scss',
})
export class SigninTokenComponent implements OnInit {
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usersService = inject(UsersService);
  private messagesService = inject(MessagesService);
  private seoService = inject(SeoService);
  private document = inject(DOCUMENT);


  ngOnInit(): void {
    this.seoService.setSeo({
      title: 'Secure Sign In | Plantour',
      description: 'Finish your secure Plantour sign-in flow.',
      canonicalUrl: this.toAbsoluteUrl('/signin-token'),
      ogType: 'website',
      robots: 'noindex, nofollow, noarchive, nosnippet',
      jsonLd: null,
    });

    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.errorMessage = 'No token provided';
      return;
    }

    this.isLoading = true;

    this.usersService.loginAdminByToken(token).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (result) => {
          this.successMessage = 'You are now signed in. Redirecting to dashboard...';
          this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = 'Sign In failed. The link may be expired. Please try to sign in one more time.';
        //this.router.navigate(['/sign-in']);
      }
    });
  }

  goToSignIn(): void {
    this.router.navigate(['/sign-in']);
  }

  private toAbsoluteUrl(path: string): string {
    try {
      return new URL(path, this.document.baseURI).toString();
    } catch {
      return path;
    }
  }

}
