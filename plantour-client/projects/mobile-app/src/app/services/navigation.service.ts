import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

export interface NavigationState {
  showBackButton: boolean;
  backPath: string;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private navigationState = new BehaviorSubject<NavigationState>({
    showBackButton: false,
    backPath: '/'
  });

  public navigationState$ = this.navigationState.asObservable();

  constructor(private router: Router) {
    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateNavigationState(event.url);
      });
  }

  private updateNavigationState(currentUrl: string): void {
    // Define navigation logic based on current route
    const state: NavigationState = {
      showBackButton: false,
      backPath: '/'
    };

    // Landing page - no back button
    if (currentUrl === '/' || currentUrl === '') {
      state.showBackButton = false;
    }
    // Register page - back to landing
    else if (currentUrl.startsWith('/register')) {
      state.showBackButton = true;
      state.backPath = '/';
    }
    // Edit forms - back to list (this will be expanded as routes are added)
    else if (currentUrl.includes('/edit/')) {
      // Extract the base path (e.g., /items/edit/1 -> /items)
      const parts = currentUrl.split('/');
      const editIndex = parts.indexOf('edit');
      if (editIndex > 0) {
        state.backPath = parts.slice(0, editIndex).join('/');
      }
      state.showBackButton = true;
    }
    // Detail views - back to list
    else if (currentUrl.includes('/detail/') || currentUrl.includes('/view/')) {
      const parts = currentUrl.split('/');
      const detailIndex = parts.findIndex(p => p === 'detail' || p === 'view');
      if (detailIndex > 0) {
        state.backPath = parts.slice(0, detailIndex).join('/');
      }
      state.showBackButton = true;
    }
    // Other pages - back to landing
    else {
      state.showBackButton = true;
      state.backPath = '/';
    }

    this.navigationState.next(state);
  }

  public navigateBack(): void {
    const state = this.navigationState.value;
    this.router.navigate([state.backPath]);
  }

  public setCustomBackPath(path: string, show: boolean = true): void {
    this.navigationState.next({
      showBackButton: show,
      backPath: path
    });
  }
}
