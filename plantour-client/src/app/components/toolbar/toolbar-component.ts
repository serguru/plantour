import { Component, OnInit, OnDestroy, inject, ElementRef, HostListener, ViewChild } from '@angular/core';
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


  //@ViewChild('popoverFeatures') popoverFeatures!: ElementRef;

  private usersService = inject(UsersService);
  private appService = inject(AppService);



  onTravelersClick($event, popover) {
    $event.preventDefault();
    popover.hide();
    this.router.navigate(["travelers"]);
  }

  onThingsClick($event, popover) {
    $event.preventDefault();
    popover.hide();
    this.router.navigate(["things"]);
  }

  onPacksClick($event, popover) {
    $event.preventDefault();
    popover.hide();
    this.router.navigate(["packs"]);
  }

  featureClick($event, path: string, popover) {
    $event.preventDefault();
    popover.hide();
    this.navigateTo(path);
  }

  featuresMenuItems: any[] = [
      {
        label: this.usersService.currentUserText,
        componentId: 'profile',
        icon: 'pi pi-user',
        command: ($event, popover) => this.featureClick($event, '/profile', popover)
      },
      {
        label: 'Contact Us',
        componentId: 'contact',
        icon: 'pi pi-envelope',
        command: ($event, popover) => this.featureClick($event, '/contact', popover)
      },
      {
        label: 'Help',
        componentId: 'help',
        icon: 'pi pi-question-circle',
        command: ($event, popover) => this.featureClick($event, '/help', popover)
      },
      {
        label: 'Terms of Usage',
        componentId: 'terms',
        icon: 'pi pi-file',
        command: ($event, popover) => this.featureClick($event, '/terms', popover)
      },
      {
        label: 'Privacy Policy',
        componentId: 'privacy',
        icon: 'pi pi-shield',
        command: ($event, popover) => this.featureClick($event, '/privacy', popover)
      },
      {
        label: 'Sign Up',
        componentId: 'sign-up',
        icon: 'pi pi-sign-up',
        command: ($event, popover) => this.featureClick($event, '/sign-up', popover)
      },
      {
        separator: true
      },
      {
        label: 'Sign In',
        componentId: 'sign-in',
        icon: 'pi pi-sign-in',
        command: ($event, popover) => this.featureClick($event, '/sign-in', popover)
      },
      {
        label: 'Sign Out',
        icon: 'pi pi-sign-out',
        command: ($event, popover) => {
          this.usersService.signOut();
          this.featureClick($event, '/sign-in', popover);
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

  onTripsClick($event, popover): void {
    $event.preventDefault();
    popover.hide();
    this.router.navigate(['/trips']);
  }

  onTripParticipantsClick($event, popover): void {
  
    $event.preventDefault();
    popover.hide();

    if (!this.tripSelected) {
      return;
    }
    this.router.navigate([`/trips/${this.tripSelected.id}/trip-participants`]);
  }

  onTripThingsClick($event, popover): void {
    $event.preventDefault();
    popover.hide();

    if (!this.tripSelected) {
      return;
    }
    this.router.navigate([`/trips/${this.tripSelected.id}/trip-things`]);
  }

  onTripPacksClick($event, popover): void {
    $event.preventDefault();
    popover.hide();

    if (!this.tripSelected) {
      return;
    }
    this.router.navigate([`/trips/${this.tripSelected.id}/trip-packs`]);
  }

  onTripSharedClick($event, popover): void {
    $event.preventDefault();
    popover.hide();

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
