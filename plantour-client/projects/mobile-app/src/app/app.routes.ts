import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing-new-user.component').then(m => m.LandingNewUserComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
