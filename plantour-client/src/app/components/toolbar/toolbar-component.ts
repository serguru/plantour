import { Component, OnInit, OnDestroy, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { debounceTime, fromEvent, Subject, takeUntil } from 'rxjs';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { UsersService } from '../../services/users-service';
import { ToolbarButton, ToolbarService } from '../../services/toolbar-service';
import { AppService } from '../../services/app-service';
import { DeviceMode } from '../../services/enums';

@Component({
  selector: 'app-toolbar',
  imports: [
    CommonModule, 
    MenuModule, 
    ButtonModule, 
    TooltipModule
  ],
  templateUrl: './toolbar-component.html',
  styleUrl: './toolbar-component.scss',
})
export class Toolbar implements OnInit {
  private usersService = inject(UsersService);
  private toolbarService = inject(ToolbarService);
  private appService = inject(AppService);

  DeviceMode = DeviceMode;

  dynamicMenus: any[] | null = null;
  dynamicButtons: ToolbarButton[] | null = null;

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
        command: () => this.navigateTo('/sign-up')
      },
      {
        separator: true
      },
      {
        label: 'Sign In',
        icon: 'pi pi-sign-in',
        command: () => this.navigateTo('/sign-in')
      },
      {
        label: 'Sign Out',
        icon: 'pi pi-sign-in',
        command: () => {
          this.usersService.signOut();
          this.navigateTo('/sign-in');
        }
      },
    ];
  }

  deviceMode: DeviceMode = DeviceMode.Unknown;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    this.appService.routeActivated$.subscribe(componentRef => {
    });

    this.appService.routeDeActivated$.subscribe(componentRef => {
      this.toolbarService.setCurrentButtons(null);
      this.toolbarService.setCurrentMenus(null);
    });

    this.appService.deviceMode$.subscribe(mode => {
      this.deviceMode = mode;
    });

    this.toolbarService.currentMenus$.subscribe(items => {
      this.dynamicMenus = items;
    });

    this.toolbarService.currentButtons$.subscribe(items => {
      this.dynamicButtons = items;
    });
  }


  onLogoClick(): void {
    this.router.navigate(['/']);
  }

  private navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
