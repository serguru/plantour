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
    path: 'admins-participant',
    loadComponent: () => import('./components/admins-participant/admins-participant.component').then(m => m.AdminsParticipantComponent)
  },
  {
    path: 'admins-participant/add',
    loadComponent: () => import('./components/admins-participant/add-admins-participant/add-admins-participant.component').then(m => m.AddAdminsParticipantComponent)
  },
  {
    path: 'admins-participant/edit/:id',
    loadComponent: () => import('./components/admins-participant/edit-admins-participant/edit-admins-participant.component').then(m => m.EditAdminsParticipantComponent)
  },
  {
    path: 'test-layout',
    loadComponent: () => import('./components/test-layout/test-layout.component').then(m => m.TestLayoutComponent)
  },
  {
    path: 'page-wrapper-demo',
    loadComponent: () => import('./components/page-wrapper-demo/page-wrapper-demo').then(m => m.PageWrapperDemo)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
