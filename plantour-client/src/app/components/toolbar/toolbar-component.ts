import { Component, OnInit, OnDestroy, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { debounceTime, fromEvent, Subject, takeUntil } from 'rxjs';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { UsersService } from '../../services/users-service';
import { AppService } from '../../services/app-service';
import { PopoverModule } from 'primeng/popover';
import { TripDto } from '../../services/trip-service';

@Component({
  selector: 'app-toolbar',
  imports: [
    CommonModule, 
    MenuModule, 
    ButtonModule, 
    TooltipModule,
    PopoverModule
  ],
  templateUrl: './toolbar-component.html',
  styleUrl: './toolbar-component.scss',
})
export class Toolbar implements OnInit {
  private usersService = inject(UsersService);
  private appService = inject(AppService);



  onTravelersClick($event, popover) {
    $event.preventDefault();
    popover.toggle($event);
    this.router.navigate(["travelers"]);
  }

  onThingsClick($event, popover) {
    $event.preventDefault();
    popover.toggle($event);
    this.router.navigate(["things"]);
  }

  onPacksClick($event, popover) {
    $event.preventDefault();
    popover.toggle($event);
    this.router.navigate(["packs"]);
  }

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
    });

  }


  onLogoClick(): void {
    this.router.navigate(['/']);
  }

  private navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  showConsole(): void {
    console.log('Toolbar Component');
  }

  onDashboardClick($event): void {
    $event.preventDefault();
    this.router.navigate(['/']);
  }

  onTripsClick($event): void {
    $event.preventDefault();
    this.router.navigate(['/trips']);
  }

  onTripParticipantsClick($event): void {
    $event.preventDefault();

    if (!this.tripSelected) {
      return;
    }
    this.router.navigate([`/trips/${this.tripSelected.id}/trip-participants`]);
  }

  onTripThingsClick($event): void {
    $event.preventDefault();

    if (!this.tripSelected) {
      return;
    }
    this.router.navigate([`/trips/${this.tripSelected.id}/trip-things`]);
  }

  onTripPacksClick($event): void {
    $event.preventDefault();

    if (!this.tripSelected) {
      return;
    }
    this.router.navigate([`/trips/${this.tripSelected.id}/trip-packs`]);
  }

  onTripSharedClick($event): void {
    $event.preventDefault();

    if (!this.tripSelected) {
      return;
    }
    this.router.navigate([`/trips/${this.tripSelected.id}/trip-shared`]);
  }

  isNavigatedComponent(componentId: string): boolean {
    return this.componentNavigated && this.componentNavigated.componentId === componentId;
  }

  get isCurrentTrip(): boolean {
    const result = this.tripSelected !== null;
    return result;
  }


  // get menuItems(): MenuItem[] {
  //   return [
  //     {
  //       label: this.usersService.currentUserText,
  //       icon: 'pi pi-user',
  //       command: () => this.navigateTo('/profile')
  //     },
  //     {
  //       label: 'Help',
  //       icon: 'pi pi-question-circle',
  //       command: () => this.navigateTo('/help')
  //     },
  //     {
  //       label: 'Terms of Usage',
  //       icon: 'pi pi-file',
  //       command: () => this.navigateTo('/terms')
  //     },
  //     {
  //       label: 'Privacy Policy',
  //       icon: 'pi pi-shield',
  //       command: () => this.navigateTo('/privacy')
  //     },
  //     {
  //       label: 'Contact Us',
  //       icon: 'pi pi-envelope',
  //       command: () => this.navigateTo('/contact')
  //     },
  //     {
  //       label: 'Sign Up',
  //       // icon: 'pi pi-user-plus',
  //       icon: 'pi pi-sign-up',
  //       command: () => this.navigateTo('/sign-up')
  //     },
  //     {
  //       separator: true
  //     },
  //     {
  //       label: 'Sign In',
  //       icon: 'pi pi-sign-in',
  //       command: () => this.navigateTo('/sign-in')
  //     },
  //     {
  //       label: 'Sign Out',
  //       icon: 'pi pi-sign-in',
  //       command: () => {
  //         this.usersService.signOut();
  //         this.navigateTo('/sign-in');
  //       }
  //     },
  //   ];
  // }



}
