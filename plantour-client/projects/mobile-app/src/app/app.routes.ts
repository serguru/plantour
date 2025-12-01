import { Routes } from '@angular/router';
import { authGuard, adminGuard, participantGuard, landingNewUserGuard, landingRegisteredUserGuard } from 'shared-lib';

export const routes: Routes = [
  {
    path: '',
    canMatch: [landingNewUserGuard],
    loadComponent: () => import('./components/landing-new-user/landing-new-user.component').then(m => m.LandingNewUserComponent)
  },
  {
    path: '',
    canMatch: [landingRegisteredUserGuard],
    loadComponent: () => import('./components/landing-registered-user/landing-registered-user.component').then(m => m.LandingRegisteredUserComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register-user/register-user').then(m => m.RegisterUserComponent)
  },
  {
    path: 'sign-in',
    loadComponent: () => import('./components/sign-in/sign-in').then(m => m.SignInComponent)
  },
  {
    path: 'landing-registered',
    loadComponent: () => import('./components/landing-registered-user/landing-registered-user.component').then(m => m.LandingRegisteredUserComponent)
  },
  {
    path: 'travelers',
    loadComponent: () => import('./components/travelers/travelers.component').then(m => m.TravelersComponent)
  },
  {
    path: 'things',
    loadComponent: () => import('./components/things/things.component').then(m => m.ThingsComponent)
  },
  {
    path: 'packs',
    loadComponent: () => import('./components/packs/packs.component').then(m => m.PacksComponent)
  },
  {
    path: 'trips',
    loadComponent: () => import('./components/trips/trips.component').then(m => m.TripsComponent)
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
