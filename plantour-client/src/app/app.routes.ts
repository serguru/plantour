import { Routes } from '@angular/router';
import { dashboardGuard, landingExistingUserGuard, landingNewUserGuard } from './guards/landing-guard';
import { adminOnlyGuard, adminOrParticipantGuard, checkTripIdGuard, publicGuard, signInGuard } from './guards/auth-guard';
import { CleanupResolver } from './helpers/resolver';
import { TripFormComponent } from './components/trips/trip-form/trip-form-component';
import { resolve } from 'path/win32';


// TODO: verify checkTripIdGuard use
// TODO: app icon on mobile
// TODO: ensure the app properly limits access to features based on user status and plan including payments, items and participants limits
export const routes: Routes = [
  {
    path: '',
    canMatch: [landingNewUserGuard],
    loadComponent: () => import('./components/landing-new-user/landing-new-user.component').then(m => m.LandingNewUserComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'landing-new' }
  },
  {
    path: '',
    canMatch: [landingExistingUserGuard],
    loadComponent: () => import('./components/dashboard/dashboard-component').then(m => m.DashboardComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'dashboard' }
  },
  {
    path: 'dashboard',
    canActivate: [dashboardGuard],
    loadComponent: () => import('./components/dashboard/dashboard-component').then(m => m.DashboardComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'dashboard' }
  },
  // {
  //   path: '',
  //   canMatch: [landingRegisteredUserGuard],
  //   loadComponent: () => import('./components/landing-registered-user/landing-registered-user.component').then(m => m.LandingRegisteredUserComponent),
  //   resolve: { cleanup: CleanupResolver },
  //   data: { componentId: 'landing-registered' }
  // },
  {
    path: 'sign-in',
    canActivate: [signInGuard],
    loadComponent: () => import('./components/sign-in/sign-in').then(m => m.SignInComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'sign-in' }
  },
  {
    path: 'sign-in/participant',
    canActivate: [publicGuard],
    loadComponent: () => import('./components/sign-in/sign-in').then(m => m.SignInComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'sign-in' }
  },
  {
    path: 'signin-token',
    //canActivate: [publicGuard],
    loadComponent: () => import('./components/signin-token/signin-token').then(m => m.SigninTokenComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'signin-token' }
  },
  {
    path: 'help',
    loadComponent: () => import('./components/help/help-component').then(m => m.HelpComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'help' }
  },
  {
    path: 'help/:section/:subsection',
    loadComponent: () => import('./components/help/help-component').then(m => m.HelpComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'help' }
  },
  {
    path: 'packing-list-generator',
    redirectTo: 'packing-list-generator/templates',
    pathMatch: 'full'
  },
  {
    path: 'packing-list-generator/templates/:templateId',
    loadComponent: () => import('./components/features/public-templates/public-template-detail/public-template-detail-component').then(m => m.PublicTemplateDetailComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'public-template-detail' }
  },
  {
    path: 'packing-list-generator/templates',
    loadComponent: () => import('./components/features/public-templates/public-templates-component').then(m => m.PublicTemplatesComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'public-templates' }
  },
  // {
  //   path: 'landing-registered',
  //   canActivate: [adminOrParticipantGuard],
  //   loadComponent: () => import('./components/landing-registered-user/landing-registered-user.component').then(m => m.LandingRegisteredUserComponent),
  //   resolve: { cleanup: CleanupResolver },
  //   data: { componentId: 'landing-registered' }
  // },
  {
    path: 'things',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/things/things-component').then(m => m.ThingsComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'things' }
  },
  {
    path: 'things/add',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/things/thing-form/thing-form-component').then(m => m.ThingFormComponent),
    resolve: { cleanup: CleanupResolver },
    data: { mode: 'add', componentId: 'thing-form' },
  },
  {
    path: 'things/edit/:id',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/things/thing-form/thing-form-component').then(m => m.ThingFormComponent),
    resolve: { cleanup: CleanupResolver },
    data: { mode: 'edit', componentId: 'thing-form' }
  },
  {
    path: 'travelers',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/travelers/travelers-component').then(m => m.TravelersComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'travelers' }
  },
  {
    path: 'travelers/add',
    canActivate: [adminOnlyGuard],
    loadComponent: () => import('./components/travelers/traveler-form/traveler-form-component').then(m => m.TravelerFormComponent),
    resolve: { cleanup: CleanupResolver },
    data: { mode: 'add', componentId: 'traveler-form' }
  },
  {
    path: 'travelers/edit/:id',
    canActivate: [adminOnlyGuard],
    loadComponent: () => import('./components/travelers/traveler-form/traveler-form-component').then(m => m.TravelerFormComponent),
    resolve: { cleanup: CleanupResolver },
    data: { mode: 'edit', componentId: 'traveler-form' }
  },
  {
    path: 'travelers/view/:id',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/travelers/traveler-form/traveler-form-component').then(m => m.TravelerFormComponent),
    resolve: { cleanup: CleanupResolver },
    data: { mode: 'view', componentId: 'traveler-form' }
  },
  {
    path: 'packs',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/packs/packs-component').then(m => m.PacksComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'packs' }
  },
  {
    path: 'packs/add',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/packs/pack-form/pack-form-component').then(m => m.PackFormComponent),
    resolve: { cleanup: CleanupResolver },
    data: { mode: 'add', componentId: 'pack-form' }
  },
  {
    path: 'packs/edit/:id',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/packs/pack-form/pack-form-component').then(m => m.PackFormComponent),
    resolve: { cleanup: CleanupResolver },
    data: { mode: 'edit', componentId: 'pack-form' }
  },
  {
    path: 'trips',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/trips/trips-component').then(m => m.TripsComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'trips' }
  },
  // {
  //   path: 'trips/trip/:tripId',
  //   canActivate: [adminOrParticipantGuard],
  //   loadComponent: () => import('./components/trips/trips-component').then(m => m.TripsComponent),
  //   resolve: { cleanup: CleanupResolver },
  //   data: { componentId: 'trips' }
  // },
  {
    path: 'trips/add',
    canActivate: [adminOnlyGuard],
    loadComponent: () => import('./components/trips/trip-form/trip-form-component').then(m => m.TripFormComponent),
    resolve: { cleanup: CleanupResolver },
    data: { mode: 'add', componentId: 'trip-form' }
  },
  {
    path: 'trips/edit/:id',
    canActivate: [adminOnlyGuard, checkTripIdGuard],
    loadComponent: () => import('./components/trips/trip-form/trip-form-component').then(m => m.TripFormComponent),
    resolve: { cleanup: CleanupResolver },
    data: { mode: 'edit', componentId: 'trip-form' }
  },
  {
    path: 'trips/view/:id',
    canActivate: [adminOrParticipantGuard, checkTripIdGuard],
    loadComponent: () => import('./components/trips/trip-form/trip-form-component').then(m => m.TripFormComponent),
    resolve: { cleanup: CleanupResolver },
    data: { mode: 'view', componentId: 'trip-form' }
  },
  {
    path: 'trips/:tripId/trip-packs',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-packs/trip-packs-component').then(m => m.TripPacksComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'trip-packs' }
  },
  {
    path: 'trips/:tripId/trip-packs/add',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-packs/trip-pack-form/trip-pack-form-component').then(m => m.TripPackFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'add', componentId: 'trip-pack-form' }
  },
  {
    path: 'trips/:tripId/trip-packs/edit/:id',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-packs/trip-pack-form/trip-pack-form-component').then(m => m.TripPackFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'edit', componentId: 'trip-pack-form' }
  },
  {
    path: 'trips/:tripId/trip-participants',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-users/trip-users-component').then(m => m.TripUsersComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'trip-users' }
  },
  {
    path: 'trips/:tripId/trip-participants/add',
    canActivate: [checkTripIdGuard, adminOnlyGuard],
    loadComponent: () => import('./components/trip-users/trip-user-form/trip-user-form-component').then(m => m.TripUserFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'add', componentId: 'trip-user-form' }
  },
  {
    path: 'trips/:tripId/trip-participants/edit/:id',
    canActivate: [checkTripIdGuard, adminOnlyGuard],
    loadComponent: () => import('./components/trip-users/trip-user-form/trip-user-form-component').then(m => m.TripUserFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'edit', componentId: 'trip-user-form' }
  },
  {
    path: 'trips/:tripId/trip-participants/view/:id',
    canActivate: [checkTripIdGuard, adminOrParticipantGuard],
    loadComponent: () => import('./components/trip-users/trip-user-form/trip-user-form-component').then(m => m.TripUserFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'view', componentId: 'trip-user-form' }
  },
  {
    path: 'trips/:tripId/trip-things',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-things/trip-things-component').then(m => m.TripThingsComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'trip-things' }
  },
  {
    path: 'trips/:tripId/trip-things/add',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-things/trip-thing-form/trip-thing-form-component').then(m => m.TripThingFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'add', componentId: 'trip-thing-form' }
  },
  {
    path: 'trips/:tripId/trip-things/edit/:id',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-things/trip-thing-form/trip-thing-form-component').then(m => m.TripThingFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'edit', componentId: 'trip-thing-form' }
  },
  {
    path: 'trips/:tripId/trip-shared',
    canActivate: [checkTripIdGuard, adminOrParticipantGuard],
    loadComponent: () => import('./components/trip-shared/trip-shared-component').then(m => m.TripSharedComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'trip-shared' }
  },
  {
    path: 'trips/:tripId/trip-shared/add',
    canActivate: [checkTripIdGuard, adminOnlyGuard],
    loadComponent: () => import('./components/trip-shared/trip-shared-form/trip-shared-form-component').then(m => m.TripSharedFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'add', componentId: 'trip-shared-form' }
  },
  {
    path: 'trips/:tripId/trip-shared/edit/:id',
    canActivate: [checkTripIdGuard, adminOnlyGuard],
    loadComponent: () => import('./components/trip-shared/trip-shared-form/trip-shared-form-component').then(m => m.TripSharedFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'edit', componentId: 'trip-shared-form' }
  },
  {
    path: 'trips/:tripId/trip-shared/view/:id',
    canActivate: [checkTripIdGuard, adminOrParticipantGuard],
    loadComponent: () => import('./components/trip-shared/trip-shared-form/trip-shared-form-component').then(m => m.TripSharedFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'view', componentId: 'trip-shared-form' }
  },
  {
    path: 'trips/:tripId/trip-comments',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-comments/trip-comments-component').then(m => m.TripCommentsComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'trip-comments' }
  },
  {
    path: 'contact',
    loadComponent: () => import('./components/features/contact/contact-component').then(m => m.ContactComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'contact' }
  },
  {
    path: 'privacy',
    loadComponent: () => import('./components/features/privacy/privacy-component/privacy-component').then(m => m.PrivacyComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'privacy' }
  },
  {
    path: 'profile',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/features/profile/profile-component/profile-component').then(m => m.ProfileComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'profile' }
  },
  {
    path: 'terms',
    loadComponent: () => import('./components/features/terms/terms-component/terms-component').then(m => m.TermsComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'terms' }
  },
  {
    path: 'templates',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/templates/templates-component').then(m => m.TemplatesComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'templates' }
  },
  {
    path: 'templates-ai',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/templates-ai/templates-ai-component').then(m => m.TemplatesAiComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'templates-ai' }
  },
  {
    path: 'checkout/:priceId/:priceName',
    loadComponent: () => import('./components/checkout/checkout-component').then(m => m.CheckoutComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'checkout' }
  },
  {
    path: 'plans',
    canActivate: [adminOnlyGuard],
    loadComponent: () => import('./components/plans/plans-component').then(m => m.PlansComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'plans' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];

