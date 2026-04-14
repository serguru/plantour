import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  FIRST_AUTHENTICATED_TOOLBAR_ROUTE,
  FIRST_UNAUTHENTICATED_TOOLBAR_ROUTE,
  LAST_OPEN_PAGE_STORAGE_KEY,
  normalizeStoredRoute
} from './app-route-storage';
import { LocalStorageService } from './services/local-storage-service';
import { UsersService } from './services/users-service';

const redirectToLastOpenPage = () => {
  const localStorageService = inject(LocalStorageService);
  const usersService = inject(UsersService);
  const storedRoute = localStorageService.getItem(LAST_OPEN_PAGE_STORAGE_KEY);

  if (!usersService.isAuthenticated()) {
		return FIRST_UNAUTHENTICATED_TOOLBAR_ROUTE;
  }

	return normalizeStoredRoute(storedRoute ?? FIRST_AUTHENTICATED_TOOLBAR_ROUTE);
};

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: redirectToLastOpenPage
	},
	{
		path: 'visitor-activity',
		loadComponent: () => import('./pages/visitor-activity-page').then((module) => module.VisitorActivityPage)
	},
	{
		path: 'users',
		loadComponent: () => import('./pages/users-page').then((module) => module.UsersPage)
	},
	{
		path: 'logs',
		loadComponent: () => import('./pages/logs-page').then((module) => module.LogsPage)
	},
	{
		path: 'settings',
		loadComponent: () => import('./pages/settings-page').then((module) => module.SettingsPage)
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
