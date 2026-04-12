import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { DEFAULT_AUTHENTICATED_ROUTE, LAST_OPEN_PAGE_STORAGE_KEY, normalizeStoredRoute } from './app-route-storage';
import { LocalStorageService } from './services/local-storage-service';

const redirectToLastOpenPage = () => {
  const router = inject(Router);
  const localStorageService = inject(LocalStorageService);
  const storedRoute = localStorageService.getItem(LAST_OPEN_PAGE_STORAGE_KEY);

  return router.parseUrl(normalizeStoredRoute(storedRoute ?? DEFAULT_AUTHENTICATED_ROUTE));
};

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		canActivate: [redirectToLastOpenPage],
		loadComponent: () => import('./pages/dashboard-page').then((module) => module.DashboardPage)
	},
	{
		path: 'dashboard',
		loadComponent: () => import('./pages/dashboard-page').then((module) => module.DashboardPage)
	},
	{
		path: 'visitor-activity',
		loadComponent: () => import('./pages/visitor-activity-page').then((module) => module.VisitorActivityPage)
	},
	{
		path: 'sign-in',
		loadComponent: () => import('./pages/sign-in-page').then((module) => module.SignInPage)
	},
	{
		path: 'sign-out',
		loadComponent: () => import('./pages/sign-out-page').then((module) => module.SignOutPage)
	},
	{
		path: '**',
		redirectTo: ''
	}
];
