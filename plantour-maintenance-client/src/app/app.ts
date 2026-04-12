import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { UsersService } from './services/users-service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {
  private readonly usersService = inject(UsersService);

  protected readonly currentUser = this.usersService.currentUser;
  protected readonly displayName = this.usersService.displayName;
  protected readonly isAuthenticated = this.usersService.isAuthenticated;
  protected readonly environmentName = environment.environment;
  protected readonly showNonProductionBanner = this.environmentName !== 'production';
  protected readonly title = environment.appName;

  ngOnInit(): void {
    this.usersService.restoreSession();
  }
}
