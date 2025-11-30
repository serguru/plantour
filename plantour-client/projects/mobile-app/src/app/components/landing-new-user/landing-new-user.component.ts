import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { UsersService } from 'shared-lib';

@Component({
  selector: 'app-landing-new-user',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './landing-new-user.component.html',
  styleUrl: './landing-new-user.component.scss'
})
export class LandingNewUserComponent {

  private usersService = inject(UsersService);
  
  features = [
    {
      icon: 'pi pi-check-circle',
      title: 'Smart Packing Lists',
      description: 'Create and organize your travel items with nested packing categories'
    },
    {
      icon: 'pi pi-users',
      title: 'Solo or Group Travel',
      description: 'Plan trips alone or collaborate with fellow travelers in real-time'
    },
    {
      icon: 'pi pi-globe',
      title: 'Multiple Trips',
      description: 'Manage all your adventures in one place, from weekend getaways to epic journeys'
    },
    {
      icon: 'pi pi-shield',
      title: 'Role-Based Access',
      description: 'Admins create trips and invite participants. Everyone stays organized'
    },
    {
      icon: 'pi pi-mobile',
      title: '100% Mobile Optimized UI',
      description: 'Seamless experience on any device with responsive design built for travelers on the go'
    },
    {
      icon: 'pi pi-wifi',
      title: 'Offline Access to Trips',
      description: 'Access your packing lists anytime, anywhere - even without internet connection'
    }
  ];

  constructor(private router: Router) {
    const two = this.usersService.get2();
    console.log('UsersService get2() returned:', two);
  }

  onSignUp(): void {
    // TODO: Stub - Navigate to sign up page
    // This should navigate to the registration form where new users can create an account
    console.log('Navigate to sign up page');
    alert('Sign up functionality - to be implemented');
  }

  onLogin(): void {
    // TODO: Stub - Navigate to login page
    // This should navigate to the login form for existing users
    console.log('Navigate to login page');
    alert('Login functionality - to be implemented');
  }

  scrollToFeatures(): void {
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
