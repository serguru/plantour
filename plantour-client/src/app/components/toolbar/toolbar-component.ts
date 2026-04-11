import { Component, OnInit, inject, computed, DestroyRef } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { UsersService } from '../../services/users-service';
import { AppService } from '../../services/app-service';
import { PopoverModule } from 'primeng/popover';
import { CurrentTripService } from '../../services/current-trip-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MessagesService } from '../../services/messages-service';

@Component({
  selector: 'app-toolbar',
  imports: [ButtonModule, TooltipModule, PopoverModule, RouterModule],
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

  componentNavigated: any = null;

  constructor(private router: Router) {}

  tripText = computed(() => {
    return this.currentTrip() ? this.currentTrip()!.name : 'No Trip Selected';
  });

  tripTextVisibleSignal = toSignal(this.currentTripService.currentTripVisible$);

  featureClick($event, path: string, popover) {
    $event.preventDefault();
    popover.hide();
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

  tripTextVisible(): boolean {
    return !!this.tripTextVisibleSignal() && this.usersService.isAuthenticatedSignal();
  }

  setTripTextVisible(visible: boolean): void {
    this.currentTripService.updateCurrentTripVisible(visible);
  }

  ngOnInit(): void {
    this.appService.routeActivated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(componentRef => {
      this.componentNavigated = componentRef;
    });

    this.appService.routeDeActivated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.componentNavigated = null;
    });
  }

  onLogoClick(): void {
    this.router.navigate(['/']);
  }

  onDashboardClick($event): void {
    $event.preventDefault();
    if (this.isNavigatedComponent('dashboard')) {
      return;
    }

    this.router.navigate(['/dashboard']);
  }

  isNavigatedComponent(componentId: string): boolean {
    return this.componentNavigated && this.componentNavigated.componentId === componentId;
  }

  private navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
