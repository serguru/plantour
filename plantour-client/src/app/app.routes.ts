import { Routes } from '@angular/router';
import { landingNewUserGuard, landingRegisteredUserGuard } from './guards/landing-guard';
import { adminGuard } from './guards/auth-guard';

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
    path: 'sign-in-participant',
    loadComponent: () => import('./components/sign-in-participant/sign-in-participant').then(m => m.SignInParticipantComponent)
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
    canActivate: [adminGuard],
    loadComponent: () => import('./components/travelers/travelers-component').then(m => m.TravelersComponent)
  },
  {
    path: 'travelers/add',
    canActivate: [adminGuard],
    loadComponent: () => import('./components/travelers/traveler-form-component').then(m => m.TravelerFormComponent),
    data: { mode: 'add' }
  },
  {
    path: 'travelers/edit/:id',
    canActivate: [adminGuard],
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
    path: 'trips/:tripId/trip-participants',
    loadComponent: () => import('./components/trip-participants/trip-participants-component').then(m => m.TripParticipantsComponent)
  },
  {
    path: 'trips/:tripId/trip-participants/add',
    loadComponent: () => import('./components/trip-participants/trip-participants-form-component').then(m => m.TripParticipantsFormComponent),
    data: { mode: 'add' }
  },
  {
    path: 'trips/:tripId/trip-participants/edit/:id',
    loadComponent: () => import('./components/trip-participants/trip-participants-form-component').then(m => m.TripParticipantsFormComponent),
    data: { mode: 'edit' }
  },
  {
    path: 'trips/:tripId/trip-things',
    loadComponent: () => import('./components/trip-things/trip-things-component').then(m => m.TripThingsComponent)
  },
  {
    path: 'trips/:tripId/trip-things/add',
    loadComponent: () => import('./components/trip-things/trip-thing-form-component').then(m => m.TripThingFormComponent),
    data: { mode: 'add' }
  },
  {
    path: 'trips/:tripId/trip-things/edit/:id',
    loadComponent: () => import('./components/trip-things/trip-thing-form-component').then(m => m.TripThingFormComponent),
    data: { mode: 'edit' }
  },
  {
    path: 'trips/:tripId/trip-shared',
    loadComponent: () => import('./components/trip-shared/trip-shared-component').then(m => m.TripSharedComponent)
  },
  {
    path: 'trips/:tripId/trip-shared/add',
    loadComponent: () => import('./components/trip-shared/trip-shared-form-component').then(m => m.TripSharedFormComponent),
    data: { mode: 'add' }
  },
  {
    path: 'trips/:tripId/trip-shared/edit/:id',
    loadComponent: () => import('./components/trip-shared/trip-shared-form-component').then(m => m.TripSharedFormComponent),
    data: { mode: 'edit' }
  },
  {
    path: 'contact',
    loadComponent: () => import('./components/features/contact/contact-component').then(m => m.ContactComponent)
  },
  {
    path: 'help',
    loadComponent: () => import('./components/features/help/help-component/help-component').then(m => m.HelpComponent)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./components/features/privacy/privacy-component/privacy-component').then(m => m.PrivacyComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/features/profile/profile-component/profile-component').then(m => m.ProfileComponent)
  },
  {
    path: 'terms',
    loadComponent: () => import('./components/features/terms/terms-component/terms-component').then(m => m.TermsComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
