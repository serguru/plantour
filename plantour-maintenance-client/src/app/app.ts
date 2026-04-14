import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { isPersistableRoute, LAST_OPEN_PAGE_STORAGE_KEY } from './app-route-storage';
import { LoadingComponent } from './components/loading/loading-component';
import { LocalStorageService } from './services/local-storage-service';
import { ThemePreference, ThemeService } from './services/theme-service';
import { UsersService } from './services/users-service';
import { environment } from '../environments/environment';

type ThemeOption = {
  readonly value: ThemePreference;
  readonly label: string;
};

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
  private readonly themeService = inject(ThemeService);
  private readonly hostElement = inject(ElementRef<HTMLElement>);

  protected readonly currentUser = this.usersService.currentUser;
  protected readonly displayName = this.usersService.displayName;
  protected readonly isAuthenticated = this.usersService.isAuthenticated;
  protected readonly title = environment.appName;
  protected readonly themePreference = this.themeService.preference;
  protected readonly menuOpen = signal(false);
  protected readonly themeOptions: readonly ThemeOption[] = [
    { value: 'system', label: 'Auto' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
  ];

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.menuOpen.set(false);

      if (!isPersistableRoute(event.urlAfterRedirects)) {
        return;
      }

      this.localStorageService.setItem(LAST_OPEN_PAGE_STORAGE_KEY, event.urlAfterRedirects);
    });
  }

  protected setTheme(preference: ThemePreference): void {
    this.themeService.setPreference(preference);
  }

  protected toggleToolbarMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.update((current) => !current);
  }

  protected closeToolbarMenu(): void {
    this.menuOpen.set(false);
  }

  protected onThemeOptionClick(preference: ThemePreference): void {
    this.setTheme(preference);
    this.closeToolbarMenu();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.menuOpen()) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Node)) {
      this.closeToolbarMenu();
      return;
    }

    const menuElement = this.hostElement.nativeElement.querySelector('.toolbar__menu');

    if (!menuElement?.contains(target)) {
      this.closeToolbarMenu();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscapeKey(): void {
    this.closeToolbarMenu();
  }
}
