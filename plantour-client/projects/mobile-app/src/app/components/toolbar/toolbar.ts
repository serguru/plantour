import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { NavigationService, NavigationState } from '../../services/navigation.service';

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule, MenuModule, ButtonModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  navigationState: NavigationState = {
    showBackButton: false,
    backPath: '/'
  };

  menuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => this.navigateTo('/profile')
    },
    {
      label: 'Help',
      icon: 'pi pi-question-circle',
      command: () => this.navigateTo('/help')
    },
    {
      label: 'Terms of Usage',
      icon: 'pi pi-file',
      command: () => this.navigateTo('/terms')
    },
    {
      label: 'Privacy Policy',
      icon: 'pi pi-shield',
      command: () => this.navigateTo('/privacy')
    },
    {
      label: 'Contact Us',
      icon: 'pi pi-envelope',
      command: () => this.navigateTo('/contact')
    },
    {
      separator: true
    },
    {
      label: 'Sign In',
      icon: 'pi pi-sign-in',
      command: () => this.navigateTo('/signin')
    }
  ];

  constructor(
    private navigationService: NavigationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.navigationService.navigationState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.navigationState = state;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onBackClick(): void {
    this.navigationService.navigateBack();
  }

  onLogoClick(): void {
    this.router.navigate(['/']);
  }

  private navigateTo(path: string): void {
    // Placeholder for navigation - routes will be implemented later
    console.log(`Navigate to: ${path}`);
    // this.router.navigate([path]);
  }
}
