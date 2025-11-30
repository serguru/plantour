import { Routes } from '@angular/router';
import { authGuard, adminGuard, participantGuard } from 'shared-lib';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/landing-new-user/landing-new-user.component').then(m => m.LandingNewUserComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register-user/register-user').then(m => m.RegisterUserComponent)
  }
  // ,
  // {
  //   path: 'login',
  //   loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  // },
  // // Пример защищенного маршрута для авторизованных пользователей
  // {
  //   path: 'profile',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
  // },
  // // Пример маршрута только для администраторов
  // {
  //   path: 'admin',
  //   canActivate: [adminGuard],
  //   loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent)
  // },
  // // Пример маршрута только для участников
  // {
  //   path: 'participant-dashboard',
  //   canActivate: [participantGuard],
  //   loadComponent: () => import('./components/participant-dashboard/participant-dashboard.component').then(m => m.ParticipantDashboardComponent)
  // },
  // {
  //   path: '**',
  //   redirectTo: ''
  // }
];
