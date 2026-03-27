import { Routes } from '@angular/router';
import { dashboardGuard, landingRedirectGuard } from './guards/landing-guard';
import { adminOnlyGuard, adminOrParticipantGuard, checkTripIdGuard, publicGuard, signInGuard } from './guards/auth-guard';
import { CleanupResolver } from './helpers/resolver';

export const routes: Routes = [
  {
    path: 'help',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/help/help-component').then(m => m.HelpComponent),
        resolve: { cleanup: CleanupResolver },
        data: { componentId: 'help' }
      },
      {
        path: ':sectionId/:questionSlug',
        loadComponent: () => import('./components/help/answers/help-answer-component').then(m => m.HelpAnswerComponent),
        resolve: { cleanup: CleanupResolver },
        data: { componentId: 'help' }
      },
      {
        path: ':sectionId',
        redirectTo: '',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  },
  {
    path: '',
    canActivate: [landingRedirectGuard],
    loadComponent: () => import('./components/landing-new-user/landing-new-user.component').then(m => m.LandingNewUserComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'landing-new' }
  },
  {
    path: 'dashboard',
    canActivate: [dashboardGuard],
    loadComponent: () => import('./components/dashboard/dashboard-component').then(m => m.DashboardComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'dashboard' }
  },
  {
    path: 'trip-info',
    canActivate: [dashboardGuard],
    loadComponent: () => import('./components/trip-info/trip-info-component').then(m => m.TripInfoComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'trip-info' }
  },
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
    path: 'todos',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/todos/todos-component').then(m => m.TodosComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'todos' }
  },
  {
    path: 'todos/add',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/todos/todo-form/todo-form-component').then(m => m.TodoFormComponent),
    resolve: { cleanup: CleanupResolver },
    data: { mode: 'add', componentId: 'todo-form' }
  },
  {
    path: 'todos/edit/:id',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/todos/todo-form/todo-form-component').then(m => m.TodoFormComponent),
    resolve: { cleanup: CleanupResolver },
    data: { mode: 'edit', componentId: 'todo-form' }
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
  {
    path: 'trips/trip/:tripId',
    canActivate: [adminOrParticipantGuard],
    loadComponent: () => import('./components/trips/trips-component').then(m => m.TripsComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'trips' }
  },
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
    path: 'trips/:tripId/itinerary',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-itinerary/trip-itinerary-component').then(m => m.TripItineraryComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'trip-itinerary' }
  },
  {
    path: 'trips/:tripId/itinerary/map',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-itinerary/map/map-component').then(m => m.MapComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'trip-itinerary-map' }
  },
  {
    path: 'trips/:tripId/itinerary/add',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-itinerary/trip-itinerary-form/trip-itinerary-form-component').then(m => m.TripItineraryFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'add', componentId: 'trip-itinerary-form' }
  },
  {
    path: 'trips/:tripId/itinerary/edit/:id',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-itinerary/trip-itinerary-form/trip-itinerary-form-component').then(m => m.TripItineraryFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'edit', componentId: 'trip-itinerary-form' }
  },
  {
    path: 'trips/:tripId/trip-packs',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-packs/trip-packs-component').then(m => m.TripPacksComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'trip-packs' }
  },
  {
    path: 'trips/:tripId/trip-expenses',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-expenses/trip-expenses-component').then(m => m.TripExpensesComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'trip-expenses' }
  },
  {
    path: 'trips/:tripId/trip-expenses/add',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-expenses/trip-expense-form/trip-expense-form-component').then(m => m.TripExpenseFormComponent),
    resolve: { cleanup: CleanupResolver },
    data: { mode: 'add', componentId: 'trip-expense-form' }
  },
  {
    path: 'trips/:tripId/trip-expenses/edit/:id',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-expenses/trip-expense-form/trip-expense-form-component').then(m => m.TripExpenseFormComponent),
    resolve: { cleanup: CleanupResolver },
    data: { mode: 'edit', componentId: 'trip-expense-form' }
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
    path: 'trips/:tripId/trip-todos',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-todos/trip-todos-component').then(m => m.TripTodosComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'trip-todos' }
  },
  {
    path: 'trips/:tripId/trip-todos/add',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-todos/trip-todo-form/trip-todo-form-component').then(m => m.TripTodoFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'add', componentId: 'trip-todo-form' }
  },
  {
    path: 'trips/:tripId/trip-todos/edit/:id',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-todos/trip-todo-form/trip-todo-form-component').then(m => m.TripTodoFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'edit', componentId: 'trip-todo-form' }
  },
  {
    path: 'trips/:tripId/trip-activities/personal',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-activity/personal/trip-activity-personal-component').then(m => m.TripActivityPersonalComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'trip-activities-personal' }
  },
  {
    path: 'trips/:tripId/trip-activities/personal/add',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-activity/personal/trip-activity-form/trip-activity-personal-form-component').then(m => m.TripActivityPersonalFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'add', componentId: 'trip-activity-personal-form' }
  },
  {
    path: 'trips/:tripId/trip-activities/personal/edit/:id',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-activity/personal/trip-activity-form/trip-activity-personal-form-component').then(m => m.TripActivityPersonalFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'edit', componentId: 'trip-activity-personal-form' }
  },
  {
    path: 'trips/:tripId/trip-activities/public',
    canActivate: [checkTripIdGuard, adminOrParticipantGuard],
    loadComponent: () => import('./components/trip-activity/public/trip-activity-public-component').then(m => m.TripActivityPublicComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'trip-activities-public' }
  },
  {
    path: 'trips/:tripId/trip-activities/public/add',
    canActivate: [checkTripIdGuard, adminOnlyGuard],
    loadComponent: () => import('./components/trip-activity/public/trip-activity-form/trip-activity-public-form-component').then(m => m.TripActivityPublicFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'add', componentId: 'trip-activity-public-form' }
  },
  {
    path: 'trips/:tripId/trip-activities/public/edit/:id',
    canActivate: [checkTripIdGuard, adminOnlyGuard],
    loadComponent: () => import('./components/trip-activity/public/trip-activity-form/trip-activity-public-form-component').then(m => m.TripActivityPublicFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'edit', componentId: 'trip-activity-public-form' }
  },
  {
    path: 'trips/:tripId/trip-activities/public/view/:id',
    canActivate: [checkTripIdGuard, adminOrParticipantGuard],
    loadComponent: () => import('./components/trip-activity/public/trip-activity-form/trip-activity-public-form-component').then(m => m.TripActivityPublicFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'view', componentId: 'trip-activity-public-form' }
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
    path: 'trips/:tripId/trip-shared-todos',
    canActivate: [checkTripIdGuard, adminOrParticipantGuard],
    loadComponent: () => import('./components/trip-shared-todos/trip-shared-todos-component').then(m => m.TripSharedTodosComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'trip-shared-todos' }
  },
  {
    path: 'trips/:tripId/trip-shared-todos/add',
    canActivate: [checkTripIdGuard, adminOnlyGuard],
    loadComponent: () => import('./components/trip-shared-todos/trip-shared-todo-form/trip-shared-todo-form-component').then(m => m.TripSharedTodoFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'add', componentId: 'trip-shared-todo-form' }
  },
  {
    path: 'trips/:tripId/trip-shared-expenses',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-shared-expenses/trip-shared-expenses-component').then(m => m.TripSharedExpensesComponent),
    resolve: {cleanup: CleanupResolver},
    data: { componentId: 'trip-shared-expenses' }
  },
  {
    path: 'trips/:tripId/trip-shared-expenses/add',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-shared-expenses/trip-shared-expense-form/trip-shared-expense-form-component').then(m => m.TripSharedExpenseFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'add', componentId: 'trip-shared-expense-form' }
  },
  {
    path: 'trips/:tripId/trip-shared-expenses/edit/:id',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-shared-expenses/trip-shared-expense-form/trip-shared-expense-form-component').then(m => m.TripSharedExpenseFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'edit', componentId: 'trip-shared-expense-form' }
  },
  {
    path: 'trips/:tripId/trip-shared-expenses/view/:id',
    canActivate: [checkTripIdGuard],
    loadComponent: () => import('./components/trip-shared-expenses/trip-shared-expense-form/trip-shared-expense-form-component').then(m => m.TripSharedExpenseFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'view', componentId: 'trip-shared-expense-form' }
  },
  {
    path: 'trips/:tripId/trip-shared-todos/edit/:id',
    canActivate: [checkTripIdGuard, adminOnlyGuard],
    loadComponent: () => import('./components/trip-shared-todos/trip-shared-todo-form/trip-shared-todo-form-component').then(m => m.TripSharedTodoFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'edit', componentId: 'trip-shared-todo-form' }
  },
  {
    path: 'trips/:tripId/trip-shared-todos/view/:id',
    canActivate: [checkTripIdGuard, adminOrParticipantGuard],
    loadComponent: () => import('./components/trip-shared-todos/trip-shared-todo-form/trip-shared-todo-form-component').then(m => m.TripSharedTodoFormComponent),
    resolve: {cleanup: CleanupResolver},
    data: { mode: 'view', componentId: 'trip-shared-todo-form' }
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
    path: 'search',
    loadComponent: () => import('./components/search/search-component').then(m => m.SearchComponent),
    resolve: { cleanup: CleanupResolver },
    data: { componentId: 'search' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];

