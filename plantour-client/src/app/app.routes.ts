import { Routes } from '@angular/router';
import { landingNewUserGuard, landingRegisteredUserGuard } from './guards/landing-guard';
import { adminOnlyGuard, adminOrParticipantGuard, checkTripIdGuard, publicGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    canMatch: [landingNewUserGuard],
    loadComponent: () => import('./components/landing-new-user/landing-new-user.component').then(m => m.LandingNewUserComponent),
    data: { componentId: 'landing-new' }
  },
  {
    path: '',
    canMatch: [landingRegisteredUserGuard],
    loadComponent: () => import('./components/landing-registered-user/landing-registered-user.component').then(m => m.LandingRegisteredUserComponent),
    data: { componentId: 'landing-registered' }
  },
  {
    path: 'sign-in',
    canActivate: [publicGuard],
    loadComponent: () => import('./components/sign-in/sign-in').then(m => m.SignInComponent),
    data: { componentId: 'sign-in' }
  },
  {
    path: 'sign-up',
    canActivate: [publicGuard],
    loadComponent: () => import('./components/sign-up/sign-up').then(m => m.SignUpComponent),
    data: { componentId: 'sign-up' }
  },
  {
    path: 'landing-registered',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/landing-registered-user/landing-registered-user.component').then(m => m.LandingRegisteredUserComponent),
    data: { componentId: 'landing-registered' }
  },
  {
    path: 'things',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/things/things-component').then(m => m.ThingsComponent),
    data: { componentId: 'things' }
  },
  {
    path: 'things/add',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/things/thing-form/thing-form-component').then(m => m.ThingFormComponent),
    data: { mode: 'add', componentId: 'thing-form' },
  },
  {
    path: 'things/edit/:id',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/things/thing-form/thing-form-component').then(m => m.ThingFormComponent),
    data: { mode: 'edit', componentId: 'thing-form' }
  },
    {
    path: 'travelers',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/travelers/travelers-component').then(m => m.TravelersComponent),
    data: { componentId: 'travelers' }
  },
  {
    path: 'travelers/add',
    canActivate: [adminOnlyGuard],
    loadComponent: () => import('./components/travelers/traveler-form/traveler-form-component').then(m => m.TravelerFormComponent),
    data: { mode: 'add', componentId: 'traveler-form' }
  },
  {
    path: 'travelers/edit/:id',
    canActivate: [adminOnlyGuard],
    loadComponent: () => import('./components/travelers/traveler-form/traveler-form-component').then(m => m.TravelerFormComponent),
    data: { mode: 'edit', componentId: 'traveler-form' }
  },
  {
    path: 'travelers/view/:id',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/travelers/traveler-form/traveler-form-component').then(m => m.TravelerFormComponent),
    data: { mode: 'view', componentId: 'traveler-form' }
  },
  {
    path: 'packs',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/packs/packs-component').then(m => m.PacksComponent),
    data: { componentId: 'packs' }
  },
  {
    path: 'packs/add',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/packs/pack-form/pack-form-component').then(m => m.PackFormComponent),
    data: { mode: 'add', componentId: 'pack-form' }
  },
  {
    path: 'packs/edit/:id',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/packs/pack-form/pack-form-component').then(m => m.PackFormComponent),
    data: { mode: 'edit', componentId: 'pack-form' }
  },

  {
    path: 'trips',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/trips/trips-component').then(m => m.TripsComponent),
    data: { componentId: 'trips' }
  },
  {
    path: 'trips/add',
    canActivate: [adminOnlyGuard],
    loadComponent: () => import('./components/trips/trip-form/trip-form-component').then(m => m.TripFormComponent),
    data: { mode: 'add', componentId: 'trip-form' }
  },
  {
    path: 'trips/edit/:id',
    canActivate: [adminOnlyGuard, checkTripIdGuard],
    loadComponent: () => import('./components/trips/trip-form/trip-form-component').then(m => m.TripFormComponent),
    data: { mode: 'edit', componentId: 'trip-form' }
  },
  {
    path: 'trips/view/:id',
    canActivate: [adminOrParticipantGuard, checkTripIdGuard],
    loadComponent: () => import('./components/trips/trip-form/trip-form-component').then(m => m.TripFormComponent),
    data: { mode: 'view', componentId: 'trip-form' }
  },
  {
    path: 'trips/:tripId/trip-packs',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-packs/trip-packs-component').then(m => m.TripPacksComponent),
    data: { componentId: 'trip-packs' }
  },
  {
    path: 'trips/:tripId/trip-packs/add',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-packs/trip-pack-form/trip-pack-form-component').then(m => m.TripPackFormComponent),
    data: { mode: 'add', componentId: 'trip-pack-form' }
  },
  {
    path: 'trips/:tripId/trip-packs/edit/:id',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-packs/trip-pack-form/trip-pack-form-component').then(m => m.TripPackFormComponent),
    data: { mode: 'edit', componentId: 'trip-pack-form' }
  },
  {
    path: 'trips/:tripId/trip-participants',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-users/trip-users-component').then(m => m.TripUsersComponent),
    data: { componentId: 'trip-users' }
  },
  {
    path: 'trips/:tripId/trip-participants/add',
    canActivate: [checkTripIdGuard, adminOnlyGuard],
    loadComponent: () => import('./components/trip-users/trip-user-form/trip-user-form-component').then(m => m.TripUserFormComponent),
    data: { mode: 'add', componentId: 'trip-user-form' }
  },
  {
    path: 'trips/:tripId/trip-participants/edit/:id',
    canActivate: [checkTripIdGuard, adminOnlyGuard],
    loadComponent: () => import('./components/trip-users/trip-user-form/trip-user-form-component').then(m => m.TripUserFormComponent),
    data: { mode: 'edit', componentId: 'trip-user-form' }
  },
  {
    path: 'trips/:tripId/trip-things',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-things/trip-things-component').then(m => m.TripThingsComponent),
    data: { componentId: 'trip-things' }
  },
  {
    path: 'trips/:tripId/trip-things/add',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-things/trip-thing-form/trip-thing-form-component').then(m => m.TripThingFormComponent),
    data: { mode: 'add', componentId: 'trip-thing-form' }
  },
  {
    path: 'trips/:tripId/trip-things/edit/:id',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-things/trip-thing-form/trip-thing-form-component').then(m => m.TripThingFormComponent),
    data: { mode: 'edit', componentId: 'trip-thing-form' }
  },
  {
    path: 'trips/:tripId/trip-shared',
    canActivate: [checkTripIdGuard, adminOrParticipantGuard],
    loadComponent: () => import('./components/trip-shared/trip-shared-component').then(m => m.TripSharedComponent),
    data: { componentId: 'trip-shared' }
  },
  {
    path: 'trips/:tripId/trip-shared/add',
    canActivate: [checkTripIdGuard, adminOnlyGuard],
    loadComponent: () => import('./components/trip-shared/trip-shared-form/trip-shared-form-component').then(m => m.TripSharedFormComponent),
    data: { mode: 'add', componentId: 'trip-shared-form' }
  },
  {
    path: 'trips/:tripId/trip-shared/edit/:id',
    canActivate: [checkTripIdGuard, adminOnlyGuard],
    loadComponent: () => import('./components/trip-shared/trip-shared-form/trip-shared-form-component').then(m => m.TripSharedFormComponent),
    data: { mode: 'edit', componentId: 'trip-shared-form' }
  },
  {
    path: 'trips/:tripId/trip-comments',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-comments/trip-comments-component').then(m => m.TripCommentsComponent),
    data: { componentId: 'trip-comments' }
  },
  {
    path: 'contact',
    loadComponent: () => import('./components/features/contact/contact-component').then(m => m.ContactComponent),
    data: { componentId: 'contact' }
  },
  {
    path: 'help',
    loadComponent: () => import('./components/features/help/help-component/help-component').then(m => m.HelpComponent),
    data: { componentId: 'help' }
  },
  {
    path: 'privacy',
    loadComponent: () => import('./components/features/privacy/privacy-component/privacy-component').then(m => m.PrivacyComponent),
    data: { componentId: 'privacy' }
  },
  {
    path: 'profile',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/features/profile/profile-component/profile-component').then(m => m.ProfileComponent),
    data: { componentId: 'profile' }
  },
  {
    path: 'terms',
    loadComponent: () => import('./components/features/terms/terms-component/terms-component').then(m => m.TermsComponent),
    data: { componentId: 'terms' }
  },
  {
    path: 'templates',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/templats/templates-component').then(m => m.TemplatesComponent),
    data: { componentId: 'templates' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
