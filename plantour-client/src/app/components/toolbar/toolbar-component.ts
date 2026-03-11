import { Component, OnInit, inject, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { UsersService } from '../../services/users-service';
import { AppService } from '../../services/app-service';
import { PopoverModule } from 'primeng/popover';
import { TripDto } from '../../services/trip-service';
import { CurrentTripService } from '../../services/current-trip-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MessagesService } from '../../services/messages-service';

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

  usersService = inject(UsersService);
  messagesService = inject(MessagesService);
  appService = inject(AppService);
  currentTripService = inject(CurrentTripService);
  currentTrip = toSignal(this.currentTripService.currentTripDto$);
  private destroyRef = inject(DestroyRef);

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
    this.router.navigate(["templates"]);
  }

  onAiTemplatesClick($event, popover) {
    $event.preventDefault();
    popover.hide();
    this.router.navigate(["templates-ai"]);
  }

  featureClick($event, path: string, popover) {
    $event.preventDefault();
    popover.hide();
    if (path === 'trip-text') {
      this.setTripTextVisible(!this.tripTextVisible());
      return;
    }
    this.navigateTo(path);
  }

  onToggleTripTextClick($event, popover) {
    $event.preventDefault();
    popover.hide();
    this.setTripTextVisible(!this.tripTextVisible());
  }

  get tripTextLabel() {
    return this.tripTextVisible() ? 'Hide Trip' : 'Show Trip';
  }

  async signOut($event, popover): Promise<void> {
    if (this.usersService.isTemporarySignal()) {
      const result = await this.messagesService.openOkCancel({
        title: `Sign Out`,
        message: `If you sign out of your temporary account, you won't be able to return to it. To avoid losing your test data, we recommend opening your profile and entering your actual email instead ${this.usersService.userEmail()}. Do you still want to sign out?`,
        okLabel: 'Yes',
        cancelLabel: 'Cancel'
      });

      if (result !== 'ok') {
        return;
      }
    }
    this.usersService.signOut();
    this.featureClick($event, '/sign-in', popover);
  }

  componentNavigated: any = null;

  constructor(
    private router: Router
  ) { }




  tripText = computed(() => {
    return this.currentTrip() ? this.currentTrip()!.name : 'No Trip Selected';
  });


  tripTextVisible = toSignal(this.currentTripService.currentTripVisible$);

  setTripTextVisible(visible: boolean): void {
    this.currentTripService.updateCurrentTripVisible(visible);
  }

  ngOnInit(): void {

    this.appService.routeActivated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(componentRef => {
      this.componentNavigated = componentRef;
    });

    this.appService.routeDeActivated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(componentRef => {
      this.componentNavigated = null;
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

    if (!this.currentTrip()) {
      return;
    }
    this.router.navigate([`/trips/${this.currentTrip()!.id}/trip-participants`]);
  }

  onTripThingsClick($event, popover): void {
    if (this.disableParticipantOnlyFeatures()) {
      return;
    }
    $event.preventDefault();
    popover.hide();

    if (!this.currentTrip()) {
      return;
    }
    this.router.navigate([`/trips/${this.currentTrip()!.id}/trip-things`]);
  }

  onTripPacksClick($event, popover): void {
    if (this.disableParticipantOnlyFeatures()) {
      return;
    }
    $event.preventDefault();
    popover.hide();

    if (!this.currentTrip()) {
      return;
    }
    this.router.navigate([`/trips/${this.currentTrip()!.id}/trip-packs`]);
  }

  onTripSharedClick($event, popover): void {
    $event.preventDefault();
    popover.hide();

    if (!this.currentTrip()) {
      return;
    }
    this.router.navigate([`/trips/${this.currentTrip()!.id}/trip-shared`]);
  }

  onTripCommentsClick($event, popover): void {
    $event.preventDefault();
    popover.hide();

    if (!this.currentTrip()) {
      return;
    }
    this.router.navigate([`/trips/${this.currentTrip()!.id}/trip-comments`]);
  }

  isNavigatedComponent(componentId: string): boolean {
    return this.componentNavigated && this.componentNavigated.componentId === componentId;
  }

  isCurrentTrip = computed(() => {
    return this.currentTrip() !== null;
  });

  disableParticipantOnlyFeatures = computed(() => {
    return !this.isCurrentTrip() || !this.currentTrip()!.currentUserIncluded;
  })

}
