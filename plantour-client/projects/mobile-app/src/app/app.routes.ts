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
    path: 'packs',
    loadComponent: () => import('./components/packs/packs.component').then(m => m.PacksComponent)
  },
  {
    path: 'packs/add',
    loadComponent: () => import('./components/packs/add-pack/add-pack.component').then(m => m.AddPackComponent)
  },
  {
    path: 'packs/edit/:id',
    loadComponent: () => import('./components/packs/edit-pack/edit-pack.component').then(m => m.EditPackComponent)
  },
  {
    path: 'trips',
    loadComponent: () => import('./components/trip/trip.component').then(m => m.TripComponent)
  },
  {
    path: 'trips/add',
    loadComponent: () => import('./components/trip/add-trip/add-trip.component').then(m => m.AddTripComponent)
  },
  {
    path: 'trips/edit/:id',
    loadComponent: () => import('./components/trip/edit-trip/edit-trip.component').then(m => m.EditTripComponent)
  },
  {
    path: 'trips/:id/things',
    loadComponent: () => import('./components/trip/trip-user-thing/trip-user-thing.component').then(m => m.TripUserThingComponent)
  },
  {
    path: 'trips/:id/things/add',
    loadComponent: () => import('./components/trip/trip-user-thing/add-trip-user-thing/add-trip-user-thing.component').then(m => m.AddTripUserThingComponent)
  },
  {
    path: 'trips/:id/things/edit/:thingId',
    loadComponent: () => import('./components/trip/trip-user-thing/edit-trip-user-thing/edit-trip-user-thing.component').then(m => m.EditTripUserThingComponent)
  },
  {
    path: 'trips/:id/packages',
    loadComponent: () => import('./components/trip/trip-user-package/trip-user-package.component').then(m => m.TripUserPackageComponent)
  },
  {
    path: 'trips/:id/packages/add',
    loadComponent: () => import('./components/trip/trip-user-package/add-trip-user-package/add-trip-user-package.component').then(m => m.AddTripUserPackageComponent)
  },
  {
    path: 'trips/:id/packages/edit/:packageId',
    loadComponent: () => import('./components/trip/trip-user-package/edit-trip-user-package/edit-trip-user-package.component').then(m => m.EditTripUserPackageComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
