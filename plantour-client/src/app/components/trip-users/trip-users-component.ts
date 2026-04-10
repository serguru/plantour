import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { TripUserDto, TripUserService } from '../../services/trip-user-service';
import { ActivatedRoute, Router } from '@angular/router';
import { TripUserItemComponent } from './trip-user-item/trip-user-item-component';
import { ExpensesOverviewComponent } from '../expenses-overview/expenses-overview-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { Condition, DynamicQueryService } from '../../services/dynamic-query-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CurrentTripService } from '../../services/current-trip-service';
import { combineLatest, switchMap, tap } from 'rxjs';
import { UsersService } from '../../services/users-service';
import { AssignmentStatus } from '../../helpers/enums';
import { formatDate } from '../../helpers/utils';
import { MessagesService } from '../../services/messages-service';
import { TripSharedExpenseDto, TripSharedExpenseService } from '../../services/trip-shared-expense-service';
import { TripService } from '../../services/trip-service';

@Component({
  selector: 'app-trip-participants',
  standalone: true,
  imports: [
    ExpensesOverviewComponent,
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
  tripSharedExpenseService = inject(TripSharedExpenseService);
  tripService = inject(TripService);
  messagesService = inject(MessagesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private tripId: string | null = null;
  private currentTripUserId: string | null = null;

  usersService = inject(UsersService);
  isReadOnly = this.usersService.isParticipantSignal;
  tripUsers = signal<TripUserDto[]>([]);
  tripSharedExpenses = signal<TripSharedExpenseDto[]>([]);
  tripCurrencyAbbreviation: string | null = null;
  overviewLoaded = signal(false);
  markedTripUserIds = signal<string[]>([]);

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
    const items: MenuConfig[] = [];
    const participants = this.tripUsers();
    const markedIds = this.markedTripUserIds();
    const markedSet = new Set(markedIds);
    const allMarked = participants.length > 0 && participants.every((item) => markedSet.has(item.id));

    if (!this.isReadOnly()) {
      items.push(
        {
          label: 'Auto assign shared expenses...',
          icon: 'wallet',
          disabled: markedIds.length === 0,
          action: () => {
            void this.autoAssignSharedExpenses();
          }
        },
        {
          label: 'Mark all',
          icon: 'check-square',
          disabled: participants.length === 0 || allMarked,
          action: () => this.markAllParticipants()
        },
        {
          label: 'Unmark all',
          icon: 'times-circle',
          disabled: markedIds.length === 0,
          action: () => this.unmarkAllParticipants()
        }
      );
    }

    items.push({
      label: (this.lowerTextVisible() ? 'Hide' : 'Show') + ' Lower Text',
      icon: 'check',
      action: () => {
        this.lowerTextVisible.set(!this.lowerTextVisible());
        this.localStorageService.setComponentKey(this.componentId, 'lowerTextVisible', this.lowerTextVisible());
      }
    });

    return items;
  }
  );

  itemMetaData: any = {
    lowerTextVisible: this.lowerTextVisible,
    toggleRejectSharedAssignment: this.toggleRejectSharedAssignment.bind(this),
    markingEnabled: () => !this.isReadOnly(),
    isMarked: (id: string) => this.markedTripUserIds().includes(id),
    toggleMarked: this.toggleMarked.bind(this),
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


    this.loadData(true).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
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
      switchMap(_ => this.loadData()),
      tap(_ => {
        this.currentTripService.refreshCurrentTrip();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private generateSharedAssignmentData(tripUser: TripUserDto): void {
    tripUser.currentUserCanManageSharedAssignment = tripUser.id === this.currentTripUserId && tripUser.sharedAmount > 0;

    if (tripUser.sharedAmount <= 0) {
      tripUser.sharedAssignmentStatus = AssignmentStatus.NotAssigned;
      tripUser.sharedAssignmentStatusName = 'Not Assigned';
      tripUser.sharedAssignmentStatusText = 'No shared amount assigned';
      return;
    }

    if (tripUser.rejected) {
      tripUser.sharedAssignmentStatus = AssignmentStatus.FinishedFailure;
      tripUser.sharedAssignmentStatusName = 'Rejected';
      tripUser.sharedAssignmentStatusText = tripUser.assignedDeadline
        ? `Rejected. Deadline ${formatDate(tripUser.assignedDeadline)}.`
        : 'Rejected.';
      return;
    }

    tripUser.sharedAssignmentStatus = AssignmentStatus.AssignedNotFinished;
    tripUser.sharedAssignmentStatusName = 'Assigned';
    tripUser.sharedAssignmentStatusText = tripUser.assignedDeadline
      ? `Assigned. Deadline ${formatDate(tripUser.assignedDeadline)}.`
      : 'Assigned.';
  }

  private toggleRejectSharedAssignment(tripUser: TripUserDto): void {
    this.tripUsersService.toggleRejectSharedAssignment({
      id: tripUser.id,
      tripId: this.tripId!,
    }).pipe(
      switchMap(() => this.loadData()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.currentTripService.refreshCurrentTrip();
    });
  }

  private loadData(initSavedFeatures = false) {
    return combineLatest([
      this.tripUsersService.getAll(this.tripId!),
      this.tripSharedExpenseService.getAll(this.tripId!),
      this.tripService.getById(this.tripId!),
    ]).pipe(
      tap(([tripUsers, sharedExpenses, trip]) => {
        this.currentTripUserId = tripUsers.find((tripUser) => tripUser.userId === this.currentUserId)?.id ?? null;
        tripUsers.forEach((tripUser) => this.generateSharedAssignmentData(tripUser));
        this.tripUsers.set(tripUsers);
        this.tripSharedExpenses.set(sharedExpenses);
        this.tripCurrencyAbbreviation = trip.currency;
        this.overviewLoaded.set(true);
        this.componentService.updateEntities(tripUsers || []);
        this.pruneMarkedTripUsers(tripUsers);

        if (initSavedFeatures) {
          this.initSavedFeatures(tripUsers);
        }
      })
    );
  }

  private toggleMarked(id: string, marked: boolean): void {
    const ids = new Set(this.markedTripUserIds());
    if (marked) {
      ids.add(id);
    } else {
      ids.delete(id);
    }

    this.markedTripUserIds.set(Array.from(ids));
  }

  private markAllParticipants(): void {
    this.markedTripUserIds.set(this.tripUsers().map((item) => item.id));
  }

  private unmarkAllParticipants(): void {
    this.markedTripUserIds.set([]);
  }

  private pruneMarkedTripUsers(tripUsers: TripUserDto[]): void {
    const validIds = new Set(tripUsers.map((item) => item.id));
    const nextIds = this.markedTripUserIds().filter((id) => validIds.has(id));
    if (nextIds.length !== this.markedTripUserIds().length) {
      this.markedTripUserIds.set(nextIds);
    }
  }

  private async autoAssignSharedExpenses(): Promise<void> {
    const preview = this.buildAutoAssignPreview();
    if (!preview) {
      this.messagesService.showWarning('Select at least one participant');
      return;
    }

    if (preview.amountToAssign <= 0) {
      this.messagesService.showInfo('Nothing to assign');
      return;
    }

    const result = await this.messagesService.openOkCancel({
      title: 'Auto assign shared expenses',
      message: this.buildAutoAssignDialogMessage(preview),
      okLabel: 'Assign',
      cancelLabel: 'Cancel'
    });

    if (result !== 'ok') {
      return;
    }

    this.tripUsersService.autoAssignSharedExpenses({
      tripId: this.tripId!,
      tripUserIds: preview.participants.map((item) => item.id),
    }).pipe(
      switchMap(() => this.loadData()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.currentTripService.refreshCurrentTrip();
      this.messagesService.showInfo(`Shared expenses assigned to ${preview.participants.length} participant${preview.participants.length === 1 ? '' : 's'}`);
    });
  }

  private buildAutoAssignPreview(): AutoAssignPreview | null {
    const participants = this.tripUsers().filter((item) => this.markedTripUserIds().includes(item.id));
    if (participants.length === 0) {
      return null;
    }

    const totalAmount = this.roundCurrency(this.tripSharedExpenses().reduce((sum, item) => sum + (item.amount || 0), 0));
    const alreadyAssignedAmount = this.roundCurrency(this.tripUsers().reduce((sum, item) => sum + (item.sharedAmount || 0), 0));
    const amountToAssign = this.roundCurrency(totalAmount - alreadyAssignedAmount);
    const increments = amountToAssign > 0 ? this.splitAmount(amountToAssign, participants.length) : [];
    const minIncrement = increments.length > 0 ? Math.min(...increments) : 0;
    const maxIncrement = increments.length > 0 ? Math.max(...increments) : 0;
    const extraCentCount = increments.filter((item) => item > minIncrement).length;

    return {
      participants,
      totalAmount,
      alreadyAssignedAmount,
      amountToAssign,
      increments,
      minIncrement,
      maxIncrement,
      extraCentCount,
    };
  }

  private buildAutoAssignDialogMessage(preview: AutoAssignPreview): string {
    const total = this.formatMoney(preview.totalAmount);
    const assigned = this.formatMoney(preview.alreadyAssignedAmount);
    const toAssign = this.formatMoney(preview.amountToAssign);
    const baseShare = this.formatMoney(preview.minIncrement);

    let splitText = `The total amount is ${total}. Already assigned: ${assigned}. ${toAssign} will be assigned now. Each marked participant will receive ${baseShare}.`;

    if (preview.maxIncrement > preview.minIncrement && preview.extraCentCount > 0) {
      splitText += ` To keep the total exact, ${preview.extraCentCount} participant${preview.extraCentCount === 1 ? '' : 's'} will receive ${this.formatMoney(preview.maxIncrement)} instead.`;
    }

    splitText += ' Existing assignments will be increased by the added amount. All assignees will receive an email notification.';

    return splitText;
  }

  private splitAmount(totalAmount: number, participantsCount: number): number[] {
    if (participantsCount <= 0) {
      return [];
    }

    const totalCents = Math.round(totalAmount * 100);
    const baseCents = Math.floor(totalCents / participantsCount);
    const remainder = totalCents % participantsCount;
    const result: number[] = [];

    for (let index = 0; index < participantsCount; index++) {
      const cents = baseCents + (index >= participantsCount - remainder ? 1 : 0);
      result.push(cents / 100);
    }

    return result;
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private formatMoney(value: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

}

interface AutoAssignPreview {
  participants: TripUserDto[];
  totalAmount: number;
  alreadyAssignedAmount: number;
  amountToAssign: number;
  increments: number[];
  minIncrement: number;
  maxIncrement: number;
  extraCentCount: number;
}