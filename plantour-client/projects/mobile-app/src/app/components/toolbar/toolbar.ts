import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { UsersService, ToolbarService, ToolbarButton } from 'shared-lib';

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule, MenuModule, ButtonModule, TooltipModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar implements OnInit, OnDestroy {
  private usersService = inject(UsersService);
  private toolbarService = inject(ToolbarService);
 
  private destroy$ = new Subject<void>();
  
  dynamicButtons: ToolbarButton[] = [];

  get menuItems(): MenuItem[] {
    return [
      {
        label: this.usersService.currentUserText,
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
        label: 'Sign Up',
        // icon: 'pi pi-user-plus',
        icon: 'pi pi-sign-up',
        command: () => this.navigateTo('/register')
      },
      {
        separator: true
      },
      {
        label: 'Sign In',
        icon: 'pi pi-sign-in',
        command: () => this.navigateTo('/sign-in')
      },
    ];
  }

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.toolbarService.buttons$
      .pipe(takeUntil(this.destroy$))
      .subscribe(buttons => {
        this.dynamicButtons = buttons;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLogoClick(): void {
    this.router.navigate(['/']);
  }

  private navigateTo(path: string): void {
    console.log(`Navigate to: ${path}`);
    this.router.navigate([path]);
  }
}
