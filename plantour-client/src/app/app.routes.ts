import { Routes } from '@angular/router';
import { landingNewUserGuard, landingRegisteredUserGuard } from './guards/landing-guard';

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
    path: 'sign-in',
    loadComponent: () => import('./components/sign-in/sign-in').then(m => m.SignInComponent)
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./components/sign-up/sign-up').then(m => m.SignUpComponent)
  },
  {
    path: 'landing-registered',
    loadComponent: () => import('./components/landing-registered-user/landing-registered-user.component').then(m => m.LandingRegisteredUserComponent)
  },
  {
    path: 'things',
    loadComponent: () => import('./components/things/things.component').then(m => m.ThingsComponent)
  },
  {
    path: 'things/add',
    loadComponent: () => import('./components/things/add-thing/add-thing.component').then(m => m.AddThingComponent)
  },
  {
    path: 'things/edit/:id',
    loadComponent: () => import('./components/things/edit-thing/edit-thing.component').then(m => m.EditThingComponent)
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
    path: 'trips/:id/users',
    loadComponent: () => import('./components/trip/trip-user/trip-user.component').then(m => m.TripUserComponent)
  },
  {
    path: 'trips/:id/users/add',
    loadComponent: () => import('./components/trip/trip-user/add-trip-user/add-trip-user.component').then(m => m.AddTripUserComponent)
  },
  {
    path: 'trips/:id/users/edit/:userId',
    loadComponent: () => import('./components/trip/trip-user/edit-trip-user/edit-trip-user.component').then(m => m.EditTripUserComponent)
  },
  {
    path: 'test-layout',
    loadComponent: () => import('./components/test-layout/test-layout.component').then(m => m.TestLayoutComponent)
  },
  {
    path: 'list-actions-demo',
    loadComponent: () => import('./components/list-actions/list-actions-demo.component').then(m => m.ListActionsDemoComponent)
  },
  {
    path: 'base-list-test',
    loadComponent: () => import('./components/base-list-test/base-list-test.component').then(m => m.BaseListTestComponent)
  },
  {
    path: 'packs',
    loadComponent: () => import('./components/packs/packs').then(m => m.PacksComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
