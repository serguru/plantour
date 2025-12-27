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
import { PopoverModule } from 'primeng/popover';
import { TripDto } from '../../services/trip-service';

@Component({
  selector: 'app-toolbar1',
  imports: [
    CommonModule, 
    MenuModule, 
    ButtonModule, 
    TooltipModule,
    PopoverModule
  ],
  templateUrl: './toolbar1-component.html',
  styleUrl: './toolbar1-component.scss',
})
export class Toolbar1 implements OnInit {
  private usersService = inject(UsersService);
  private toolbarService = inject(ToolbarService);
  private appService = inject(AppService);


  dynamicMenus: any[] | null = null;
  dynamicButtons: ToolbarButton[] | null = null;

  featuresMenuItems: MenuItem[] = [
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
  

  tripSelected: TripDto | null = null;
  componentNavigated: any = null;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {

    this.appService.tripSelected$.subscribe(trip => {
      this.tripSelected = trip;
    });


    this.appService.routeActivated$.subscribe(componentRef => {
      this.componentNavigated = componentRef;
    });

    this.appService.routeDeActivated$.subscribe(componentRef => {
      this.componentNavigated = null;
    });

    this.appService.routeDeActivated$.subscribe(componentRef => {
      this.toolbarService.setCurrentButtons(null);
      this.toolbarService.setCurrentMenus(null);
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

  showConsole(): void {
    console.log('Toolbar1 Component');
  }

  onTripsClick($event): void {
    $event.preventDefault();
    this.router.navigate(['/trips']);
  }

  onTripParticipantsClick($event): void {
    $event.preventDefault();

    if (!this.tripSelected) {
      throw new Error('No trip selected');
    }
    this.router.navigate([`/trips/${this.tripSelected.id}/trip-participants`]);
  }

  



  isNavigatedComponent(componentName: string): boolean {
    return this.componentNavigated && this.componentNavigated.constructor.name === componentName;
  }

  get isCurrentTrip(): boolean {
    const result = this.tripSelected !== null;
    return result;
  }


  onTripClick(popover: any, $event: any): void {
    if (!this.isCurrentTrip) {
      this.router.navigate(['/trips']);
      return;
    }
    popover.toggle($event);
  }

}
