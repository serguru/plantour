import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/landing-new-user/landing-new-user.component').then(m => m.LandingNewUserComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
