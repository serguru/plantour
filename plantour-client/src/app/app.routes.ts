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
    loadComponent: () => import('./components/things/things-component').then(m => m.ThingsComponent)
  },
  {
    path: 'things/add',
    loadComponent: () => import('./components/things/thing-form-component').then(m => m.ThingFormComponent),
    data: { mode: 'add' }
  },
  {
    path: 'things/edit/:id',
    loadComponent: () => import('./components/things/thing-form-component').then(m => m.ThingFormComponent),
    data: { mode: 'edit' }
  },
  {
    path: 'trips',
    loadComponent: () => import('./components/trips/trips-component').then(m => m.TripsComponent)
  },
  {
    path: 'trips/add',
    loadComponent: () => import('./components/trips/trip-form-component').then(m => m.TripFormComponent),
    data: { mode: 'add' }
  },
  {
    path: 'trips/edit/:id',
    loadComponent: () => import('./components/trips/trip-form-component').then(m => m.TripFormComponent),
    data: { mode: 'edit' }
  },
  {
    path: 'travelers',
    loadComponent: () => import('./components/travelers/travelers-component').then(m => m.TravelersComponent)
  },
  {
    path: 'travelers/add',
    loadComponent: () => import('./components/travelers/traveler-form-component').then(m => m.TravelerFormComponent),
    data: { mode: 'add' }
  },
  {
    path: 'travelers/edit/:id',
    loadComponent: () => import('./components/travelers/traveler-form-component').then(m => m.TravelerFormComponent),
    data: { mode: 'edit' }
  },
  {
    path: 'packs',
    loadComponent: () => import('./components/packs/packs-component').then(m => m.PacksComponent)
  },
  {
    path: 'packs/add',
    loadComponent: () => import('./components/packs/pack-form-component').then(m => m.PackFormComponent),
    data: { mode: 'add' }
  },
  {
    path: 'packs/edit/:id',
    loadComponent: () => import('./components/packs/pack-form-component').then(m => m.PackFormComponent),
    data: { mode: 'edit' }
  },
  {
    path: 'trips/:tripId/trip-packs',
    loadComponent: () => import('./components/trip-packs/trip-packs-component').then(m => m.TripPacksComponent)
  },
  {
    path: 'trips/:tripId/trip-packs/add',
    loadComponent: () => import('./components/trip-packs/trip-pack-form-component').then(m => m.TripPackFormComponent),
    data: { mode: 'add' }
  },
  {
    path: 'trips/:tripId/trip-packs/edit/:id',
    loadComponent: () => import('./components/trip-packs/trip-pack-form-component').then(m => m.TripPackFormComponent),
    data: { mode: 'edit' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
