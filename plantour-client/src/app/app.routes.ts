import { Routes } from '@angular/router';
import { LoginComponent } from './components/users/login/login-component';
import { LayoutComponent } from './components/shared/layout/layout-component';
import { TravelersComponent } from './components/dictionaries/travelers/travelers-component';
import { ThingsComponent } from './components/dictionaries/things/things-component';
import { TripsComponent } from './components/travel/trips/trips-component';
import { RegisterComponent } from './components/users/register/register-component';
import { LandingComponent } from './components/shared/landing/landing-component';

export const routes: Routes = [
  {
    path: "",
    component: LandingComponent
  },
  {
    path: "register",
    component: RegisterComponent
  },
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: LayoutComponent,
    children: [
      { path: 'travelers', component: TravelersComponent },
      { path: 'things', component: ThingsComponent },
      { path: 'trips', component: TripsComponent },

      { path: '', redirectTo: 'travelers', pathMatch: 'full' }
    ]
  }
];
