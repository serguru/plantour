import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { TripUserDto, TripUserService } from '../../services/trip-user-service';
import { ActivatedRoute, Router } from '@angular/router';
import { TripUserItemComponent } from './trip-user-item/trip-user-item-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { Condition, DynamicQueryService } from '../../services/dynamic-query-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CurrentTripService } from '../../services/current-trip-service';
import { switchMap, tap } from 'rxjs';
import { UsersService } from '../../services/users-service';
import { AssignmentStatus } from '../../helpers/enums';
import { formatDate } from '../../helpers/utils';

@Component({
  selector: 'app-trip-participants',
  standalone: true,
  imports: [
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent
  ],
  templateUrl: './trip-users-component.html',
  styleUrl: './trip-users-component.scss',
})
export class TripUsersComponent implements OnInit {
  tripUserItemComponent = TripUserItemComponent;
  componentId: string = 'trip-users';

  componentService = inject(ComponentService);
  tripUsersService = inject(TripUserService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(DynamicQueryService);
  currentTripService = inject(CurrentTripService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private tripId: string | null = null;
  private currentTripUserId: string | null = null;

  usersService = inject(UsersService);
  isReadOnly = this.usersService.isParticipantSignal;

  conditions: Condition[] =
    [
      {
        kind: 'sort',
        label: 'Sort by Name',
        icon: 'sort-alt',
        property: 'fullName',
        sortType: 'text',
        direction: 'none'
      },
      {
        kind: 'filter',
        property: 'fullName',
        label: 'Filter by Name',
        filterText: '',
        comparisonType: 'contains',
        icon: 'filter'
      },
      {
        kind: 'filter',
        property: 'sharedAssignmentStatusName',
        label: 'Shared Assignment Status',
        filterText: '',
        comparisonType: 'exact',
        icon: 'filter'
      }
    ];

  lowerTextVisible = signal<boolean>(true);

  menuItems = computed<MenuConfig[]>(() => {
    return [
      {
        label: (this.lowerTextVisible() ? 'Hide' : 'Show') + ' Lower Text',
        icon: 'check',
        action: () => {
          this.lowerTextVisible.set(!this.lowerTextVisible());
          this.localStorageService.setComponentKey(this.componentId, 'lowerTextVisible', this.lowerTextVisible());
        }
      }
    ];
  }
  );

  itemMetaData: any = {
    lowerTextVisible: this.lowerTextVisible,
    toggleAcceptSharedAssignment: this.toggleAcceptSharedAssignment.bind(this),
    toggleRejectSharedAssignment: this.toggleRejectSharedAssignment.bind(this),
  }

  private get currentUserId(): string | null {
    return this.usersService.getCurrentUserId();
  }

  ngOnInit(): void {

    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');

    // The checkTripIdGuard should ensure this never happens
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.initConditions(this.componentId);


    this.tripUsersService.getAll(this.tripId!).pipe(
      tap((tripUsers: TripUserDto[]) => {
        this.currentTripUserId = tripUsers.find((tripUser) => tripUser.userId === this.currentUserId)?.id ?? null;
        tripUsers.forEach((tripUser) => this.generateSharedAssignmentData(tripUser));
      }),
      tap((p: TripUserDto[]) => {
        this.initSavedFeatures(p);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(tripUsers =>
      this.componentService.updateEntities(tripUsers || [])
    );
  }

  initSavedFeatures(items: TripUserDto[]) {
    const v = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    let id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    if(!items || !items.find(x => x.id === id)) {
      id = null;
    }
    this.componentService.updateSelectedId(id);

    const lowerTextVisible = this.localStorageService.getComponentBooleanKey(this.componentId, 'lowerTextVisible', true);
    this.lowerTextVisible.set(lowerTextVisible);

  }


  initConditions(componentId: string | null, packs: TripUserDto[] | null = null): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }
    const savedConditions = this.localStorageService.getComponentKeyObject(componentId, 'conditions') || [];
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);
    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }

  deleteTripUser(id: string): void {
    this.tripUsersService.delete(this.tripId!, id).pipe(
      switchMap(_ =>
        this.tripUsersService.getAll(this.tripId!)
      ),
      tap((tripUsers) => {
        this.currentTripUserId = tripUsers.find((tripUser) => tripUser.userId === this.currentUserId)?.id ?? null;
        tripUsers.forEach((tripUser) => this.generateSharedAssignmentData(tripUser));
      }),
      tap(_ => {
        this.currentTripService.refreshCurrentTrip();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripUsers) => {
      this.componentService.updateEntities(tripUsers);
    });
  }

  private generateSharedAssignmentData(tripUser: TripUserDto): void {
    tripUser.currentUserCanManageSharedAssignment = tripUser.id === this.currentTripUserId && tripUser.sharedAmount > 0;

    if (tripUser.sharedAmount <= 0) {
      tripUser.sharedAssignmentStatus = AssignmentStatus.NotAssigned;
      tripUser.sharedAssignmentStatusName = 'Not Assigned';
      tripUser.sharedAssignmentStatusText = 'No shared amount assigned';
      return;
    }

    if (tripUser.accept === 'accepted') {
      tripUser.sharedAssignmentStatus = AssignmentStatus.FinishedSuccess;
      tripUser.sharedAssignmentStatusName = 'Accepted';
      tripUser.sharedAssignmentStatusText = tripUser.assignedDeadline
        ? `Accepted. Deadline ${formatDate(tripUser.assignedDeadline)}.`
        : 'Accepted.';
      return;
    }

    if (tripUser.accept === 'rejected') {
      tripUser.sharedAssignmentStatus = AssignmentStatus.FinishedFailure;
      tripUser.sharedAssignmentStatusName = 'Rejected';
      tripUser.sharedAssignmentStatusText = tripUser.assignedDeadline
        ? `Rejected. Deadline ${formatDate(tripUser.assignedDeadline)}.`
        : 'Rejected.';
      return;
    }

    tripUser.sharedAssignmentStatus = AssignmentStatus.AssignedNotFinished;
    tripUser.sharedAssignmentStatusName = 'Pending';
    tripUser.sharedAssignmentStatusText = tripUser.assignedDeadline
      ? `Pending response. Deadline ${formatDate(tripUser.assignedDeadline)}.`
      : 'Pending response.';
  }

  private toggleAcceptSharedAssignment(tripUser: TripUserDto): void {
    this.tripUsersService.toggleAcceptSharedAssignment({
      id: tripUser.id,
      tripId: this.tripId!,
    }).pipe(
      switchMap(() => this.tripUsersService.getAll(this.tripId!)),
      tap((tripUsers) => {
        this.currentTripUserId = tripUsers.find((item) => item.userId === this.currentUserId)?.id ?? null;
        tripUsers.forEach((item) => this.generateSharedAssignmentData(item));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripUsers) => {
      this.componentService.updateEntities(tripUsers);
      this.currentTripService.refreshCurrentTrip();
    });
  }

  private toggleRejectSharedAssignment(tripUser: TripUserDto): void {
    this.tripUsersService.toggleRejectSharedAssignment({
      id: tripUser.id,
      tripId: this.tripId!,
    }).pipe(
      switchMap(() => this.tripUsersService.getAll(this.tripId!)),
      tap((tripUsers) => {
        this.currentTripUserId = tripUsers.find((item) => item.userId === this.currentUserId)?.id ?? null;
        tripUsers.forEach((item) => this.generateSharedAssignmentData(item));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripUsers) => {
      this.componentService.updateEntities(tripUsers);
      this.currentTripService.refreshCurrentTrip();
    });
  }

}