import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { isPersistableRoute, LAST_OPEN_PAGE_STORAGE_KEY } from './app-route-storage';
import { LoadingComponent } from './components/loading/loading-component';
import { LocalStorageService } from './services/local-storage-service';
import { UsersService } from './services/users-service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly localStorageService = inject(LocalStorageService);

  protected readonly currentUser = this.usersService.currentUser;
  protected readonly displayName = this.usersService.displayName;
  protected readonly isAuthenticated = this.usersService.isAuthenticated;
  protected readonly title = environment.appName;

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (!isPersistableRoute(event.urlAfterRedirects)) {
        return;
      }

      this.localStorageService.setItem(LAST_OPEN_PAGE_STORAGE_KEY, event.urlAfterRedirects);
    });
  }
}
