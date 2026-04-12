import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./pages/home-page').then((module) => module.HomePage)
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
