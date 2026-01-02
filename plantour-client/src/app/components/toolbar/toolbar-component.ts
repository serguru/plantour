import { Component, OnInit, OnDestroy, inject, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
    PopoverModule,
    RouterModule
  ],
  templateUrl: './toolbar-component.html',
  styleUrl: './toolbar-component.scss',
})
export class Toolbar implements OnInit {


  //@ViewChild('popoverFeatures') popoverFeatures!: ElementRef;

  usersService = inject(UsersService);
  appService = inject(AppService);


  onFeaturesClick($event, popoverFeatures) {
    $event.preventDefault();
    popoverFeatures.toggle($event);
  }



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

  onTemplateThingsClick($event, popover) {
    $event.preventDefault();
    popover.hide();
    this.router.navigate(["template-things"]);
  }

  featureClick($event, path: string, popover) {
    $event.preventDefault();
    popover.hide();
    if (path === 'trip-text') {
      this.setTripTextVisible(!this.tripTextVisible);
      return;
    }
    this.navigateTo(path);
  }

  onToggleTripTextClick($event, popover) {
    $event.preventDefault();
    popover.hide();
    this.setTripTextVisible(!this.tripTextVisible);
  }

  get tripTextLabel() {
    return this.tripTextVisible ? 'Hide Trip' : 'Show Trip';
  }

  signOut($event, popover): void {
    this.usersService.signOut();
    this.featureClick($event, '/sign-in', popover);
  }


  tripSelected: TripDto | null = null;
  componentNavigated: any = null;

  constructor(
    private router: Router
  ) { }


  get tripText(): string {
    if (!this.tripSelected) {
      return 'No Trip Selected';
    }
    return this.tripSelected.name || 'Unnamed Trip';
  }

  get tripTextVisible(): boolean {
    return this.appService.getTripTextVisible() && this.usersService.isAuthenticated;
  }

  setTripTextVisible(visible: boolean): void {
    this.appService.updateTripTextVisible(visible);
  }


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
    if (this.disableTripThings) {
      return;
    }
    $event.preventDefault();
    popover.hide();

    if (!this.tripSelected) {
      return;
    }
    this.router.navigate([`/trips/${this.tripSelected.id}/trip-things`]);
  }

  onTripPacksClick($event, popover): void {
    if (this.disableTripThings) {
      return;
    }
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

  onTripCommentsClick($event, popover): void {
    $event.preventDefault();
    popover.hide();

    if (!this.tripSelected) {
      return;
    }
    this.router.navigate([`/trips/${this.tripSelected.id}/trip-comments`]);
  }

  isNavigatedComponent(componentId: string): boolean {
    return this.componentNavigated && this.componentNavigated.componentId === componentId;
  }

  get isCurrentTrip(): boolean {
    const result = this.tripSelected !== null;
    return result;
  }

  get disableTripThings(): boolean {
    return !this.isCurrentTrip || (this.usersService.isAdmin && !this.tripSelected!.adminIsParticipant);
  }

  get disableTripPacks(): boolean {
    return !this.isCurrentTrip || (this.usersService.isAdmin && !this.tripSelected!.adminIsParticipant);
  }
}
