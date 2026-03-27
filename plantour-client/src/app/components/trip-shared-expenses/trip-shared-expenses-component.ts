import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InputNumber } from 'primeng/inputnumber';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, tap } from 'rxjs';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { MessagesService } from '../../services/messages-service';
import { UsersService } from '../../services/users-service';
import { TripUserDto, TripUserService } from '../../services/trip-user-service';
import { Condition, DynamicQueryService, Target, TargetCondition } from '../../services/dynamic-query-service';
import { MultipleIdsRequest } from '../../services/crud-service';
import { DocumentsService } from '../../services/documents-service';
import { AssignmentStatus } from '../../helpers/enums';
import { findDuplicates, formatDate, getDaysDifference, getFullName, getNowDaysUtc } from '../../helpers/utils';
import { TripSharedExpenseDto, TripSharedExpenseService } from '../../services/trip-shared-expense-service';
import { TripSharedExpenseItemComponent } from './trip-shared-expense-item/trip-shared-expense-item-component';

@Component({
  selector: 'app-trip-shared-expenses',
  standalone: true,
  imports: [
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent,
    FormsModule,
    InputNumber,
  ],
  templateUrl: './trip-shared-expenses-component.html',
  styleUrl: './trip-shared-expenses-component.scss',
})
export class TripSharedExpensesComponent implements OnInit {
  tripSharedExpenseItemComponent = TripSharedExpenseItemComponent;
  componentId = 'trip-shared-expenses';
  currentTripUserId: string | null = null;

  messagesService = inject(MessagesService);
  componentService = inject(ComponentService);
  tripSharedExpenseService = inject(TripSharedExpenseService);
  documentsService = inject(DocumentsService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(DynamicQueryService);
  usersService = inject(UsersService);

  isParticipant = this.usersService.isParticipantSignal;

  targetCondition = toSignal(this.componentService.targetCondition$);
  target = toSignal(this.componentService.target$);
  targetedIds = toSignal(this.componentService.targetedIds$);
  notTargetedIds = toSignal(this.componentService.notTargetedIds$);

  tripUserService = inject(TripUserService);

  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private tripId: string | null = null;

  deadlineDays = signal<number>(3);
  assigneesVisible = signal<boolean>(true);
  assignmentsVisible = signal<boolean>(true);

  showCalendarForDeadline = computed(() => {
    if (this.isParticipant()) {
      return false;
    }
    if (this.assigneesVisible()) {
      return true;
    }
    return !!this.targetCondition();
  });

  assigneesLabel = computed(() => `${this.assigneesVisible() ? 'Hide' : 'Show'} Assignees`);

  menuItems = computed<MenuConfig[]>(() => {
    const result = [
      {
        label: `${this.assignmentsVisible() ? 'Hide' : 'Show'} Assignments`,
        icon: 'check',
        action: () => {
          this.assignmentsVisible.set(!this.assignmentsVisible());
          this.localStorageService.setComponentKey(this.componentId, 'assignmentsVisible', this.assignmentsVisible());
        },
      },
      {
        label: 'Download Expenses PDF',
        icon: 'document',
        action: () => this.downloadExpensesPdf(),
      },
    ];

    if (!this.isParticipant()) {
      result.unshift({
        label: this.assigneesLabel(),
        icon: 'users',
        action: () => {
          const visible = this.assigneesVisible();
          this.assigneesVisible.set(!visible);
          if (!visible && this.targetCondition()) {
            this.messagesService.showWarning('Changing assignees visibility will have no effect while a Trip participant is selected');
          }
          this.localStorageService.setComponentKey(this.componentId, 'assigneesVisible', this.assigneesVisible());
        },
      });
    }

    return result;
  });

  conditions: Condition[] = [
    {
      kind: 'sort',
      label: 'Sort by Name',
      icon: 'sort-alt',
      property: 'name',
      sortType: 'text',
      direction: 'none',
    },
    {
      kind: 'target',
      label: 'Trip participant',
      icon: 'shopping-bag',
      target: null,
    },
    {
      kind: 'filter',
      property: 'name',
      label: 'Filter by Name',
      filterText: '',
      comparisonType: 'contains',
      icon: 'filter',
    },
    {
      kind: 'filter',
      property: 'assignmentStatusName',
      label: 'Assignment Status',
      filterText: '',
      comparisonType: 'exact',
      icon: 'filter',
    },
    {
      kind: 'filter',
      property: 'assigneeFullName',
      label: 'Assignee Full Name',
      filterText: '',
      comparisonType: 'exact',
      icon: 'filter',
    },
    {
      kind: 'filter',
      property: 'category',
      label: 'Category',
      filterText: '',
      comparisonType: 'exact',
      icon: 'filter',
    },
    {
      kind: 'filter',
      property: 'effectiveCurrency',
      label: 'Currency',
      filterText: '',
      comparisonType: 'exact',
      icon: 'filter',
    },
  ];

  itemMetaData: any = {
    assignOrUnassign: this.assignOrUnassign.bind(this),
    assigneesVisible: this.assigneesVisible,
    assignmentsVisible: this.assignmentsVisible,
    toggleAccept: this.toggleAcceptClick.bind(this),
    toggleReject: this.toggleRejectClick.bind(this),
  };

  lookup: any[] = [];

  ngOnInit(): void {
    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.tripUserService.getAll(this.tripId).pipe(
      map((tripUsers: TripUserDto[]) => {
        const currentUserId = this.usersService.getCurrentUserId();
        this.currentTripUserId = tripUsers.find(x => x.userId === currentUserId)?.id ?? null;
        this.lookup = this.initTargetLookup(tripUsers);
        this.initConditions(this.componentId, tripUsers, this.lookup);
        return this.lookup;
      }),
      switchMap((lookup) =>
        this.componentService.target$.pipe(
          switchMap((target: Target | null) => {
            if (target && target.id) {
              return this.tripSharedExpenseService.getAllForAssignee(this.tripId!, target.id);
            }
            return this.tripSharedExpenseService.getAll(this.tripId!);
          }),
          map((expenses: TripSharedExpenseDto[]) => {
            expenses.forEach(expense => this.generateStatusData(expense, lookup));
            return expenses;
          })
        )
      ),
      tap((expenses: TripSharedExpenseDto[]) => {
        this.initSavedFeatures(expenses);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((expenses) => this.componentService.updateEntities(expenses || []));
  }

  onModelChangeDays(): void {
    this.localStorageService.setComponentKey(this.componentId, 'deadlineDays', this.deadlineDays());
  }

  initSavedFeatures(items: TripSharedExpenseDto[]) {
    const actionsVisible = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(actionsVisible);

    let id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    if (!items || !items.find(x => x.id === id)) {
      id = null;
    }
    this.componentService.updateSelectedId(id);

    const assigneesVisible = this.localStorageService.getComponentBooleanKey(this.componentId, 'assigneesVisible', true);
    this.assigneesVisible.set(assigneesVisible);

    const assignmentsVisible = this.localStorageService.getComponentBooleanKey(this.componentId, 'assignmentsVisible', true);
    this.assignmentsVisible.set(assignmentsVisible);

    const deadlineDays = this.localStorageService.getComponentKey(this.componentId, 'deadlineDays');
    this.deadlineDays.set(deadlineDays ? Number(deadlineDays) : 3);
  }

  initTargetLookup(users: TripUserDto[] | null): any[] {
    if (!users) {
      this.componentService.updateTargetLookup([]);
      return [];
    }

    const duplicatedIds = findDuplicates(users);
    const lookup: { id: string; name: string }[] = [];

    users.forEach((user: TripUserDto) => {
      const isDuplicated = duplicatedIds.some(x => x === user.id);
      const name = getFullName(user.firstName ?? null, user.lastName ?? null, user.email, isDuplicated);
      lookup.push({ id: user.id, name });
    });
    lookup.sort((a, b) => a.name.localeCompare(b.name));

    this.componentService.updateTargetLookup(lookup);
    this.itemMetaData.assignees = lookup;
    return lookup;
  }

  initConditions(componentId: string | null, tripUsers: TripUserDto[] | null = null, lookup: any[] = []): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }
    const savedConditions = this.localStorageService.getComponentKeyObject(componentId, 'conditions') || [];
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);

    if (!this.isParticipant()) {
      const targetCondition: TargetCondition | undefined = initialConditions.find(c => c.kind === 'target');
      if (targetCondition) {
        const targetTripUserId = targetCondition.target?.id;
        if (targetTripUserId) {
          const tripUser = tripUsers?.find(p => p.id === targetTripUserId);
          if (tripUser) {
            targetCondition.target = {
              id: tripUser.id,
              name: lookup.find(l => l.id === tripUser.id)?.name || 'No User Name',
            };
          }
        } else {
          targetCondition.target = null;
        }
      }
    } else {
      const index = initialConditions.findIndex(c => c.kind === 'target');
      if (index !== -1) {
        initialConditions.splice(index, 1);
      }
    }

    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }

  generateStatusData = (expense: TripSharedExpenseDto, usersLookup: any[]) => {
    expense.currentUserCanAcceptOrReject = !!(expense.assignedToId && expense.assignedToId === this.currentTripUserId);

    if (!expense.assignedToId) {
      expense.assignmentStatusText = 'Awaiting assignment';
      expense.assignmentStatus = AssignmentStatus.NotAssigned;
      expense.assignmentStatusName = 'Not Assigned';
      return;
    }

    const assignee = usersLookup.find((a: any) => a.id === expense.assignedToId);
    if (!assignee) {
      throw new Error('Assignee not found');
    }

    expense.assigneeFullName = assignee.name;
    expense.assignmentStatus = AssignmentStatus.AssignedNotFinished;
    expense.assignmentStatusName = 'Assigned, Not Finished';

    let deadlineString = '';
    if (expense.assignedDeadline) {
      const daysDiff = getDaysDifference(expense.assignedDeadline);
      if (daysDiff! < 0) {
        deadlineString = ` Deadline was: ${formatDate(expense.assignedDeadline)}, ${Math.abs(daysDiff!)} days ago.`;
        expense.assignmentStatus = AssignmentStatus.FinishedFailure;
        expense.assignmentStatusName = 'Finished, Failed';
      } else if (daysDiff === 0) {
        deadlineString = ' Deadline is today.';
      } else {
        deadlineString = ` Deadline: ${formatDate(expense.assignedDeadline)} in ${daysDiff} days.`;
      }
    }

    expense.assignmentStatusText = `Assigned to ${assignee.name}`;
    if (expense.assignedAt) {
      expense.assignmentStatusText += ` on ${formatDate(expense.assignedAt)}`;
    }
    expense.assignmentStatusText += '.';

    if (expense.assignedExpenseId) {
      expense.assignmentStatusText += ' Accepted.';
    }

    if (expense.rejected) {
      expense.assignmentStatusText += ' Rejected.';
      expense.assignmentStatus = AssignmentStatus.FinishedFailure;
      expense.assignmentStatusName = 'Finished, Failed';
    }

    expense.assignmentStatusText += deadlineString;
  };

  onAddTargetClick(): void {
    const targetId = this.target()?.id;
    if (!targetId) {
      throw new Error('Target User Id is not set');
    }
    const ids = this.notTargetedIds();
    if (!ids || ids.length === 0) {
      throw new Error('No not targeted ids available');
    }
    if (!this.deadlineDays() || this.deadlineDays()! < 0 || this.deadlineDays()! > 365) {
      throw new Error('Deadline days is not set or invalid');
    }

    const transport = {
      collectionId: this.tripId!,
      ids,
      id: targetId,
      deadlineAt: getNowDaysUtc(new Date(), this.deadlineDays()),
    };

    this.tripSharedExpenseService.assign(transport).pipe(
      switchMap(() => this.tripSharedExpenseService.getAllForAssignee(this.tripId!, targetId)),
      map((expenses: TripSharedExpenseDto[]) => {
        expenses.forEach(expense => this.generateStatusData(expense, this.lookup));
        return expenses;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((expenses) => {
      this.componentService.updateEntities(expenses);
    });
  }

  onDeleteTargetClick(): void {
    const targetId = this.target()?.id;
    if (!targetId) {
      throw new Error('Target Id is not set');
    }
    const ids = this.targetedIds();
    if (!ids || ids.length === 0) {
      throw new Error('No targeted ids available');
    }

    const request: MultipleIdsRequest = {
      collectionId: this.tripId!,
      ids,
      id: targetId,
    };

    this.tripSharedExpenseService.unassign(request).pipe(
      switchMap(() => this.tripSharedExpenseService.getAllForAssignee(this.tripId!, targetId)),
      map((expenses: TripSharedExpenseDto[]) => {
        expenses.forEach(expense => this.generateStatusData(expense, this.lookup));
        return expenses;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((expenses) => {
      this.componentService.updateEntities(expenses);
    });
  }

  deleteTripSharedExpense(id: string): void {
    this.tripSharedExpenseService.delete(id, this.tripId!).pipe(
      switchMap(() => this.componentService.target$),
      switchMap((target) => {
        if (target?.id) {
          return this.tripSharedExpenseService.getAllForAssignee(this.tripId!, target.id);
        }
        return this.tripSharedExpenseService.getAll(this.tripId!);
      }),
      map((expenses: TripSharedExpenseDto[]) => {
        expenses.forEach(expense => this.generateStatusData(expense, this.lookup));
        return expenses;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((expenses) => {
      this.componentService.updateEntities(expenses);
    });
  }

  assignOrUnassign(entity: TripSharedExpenseDto, assigneeId: string | null, reassignAllowed = true): void {
    const transport = {
      collectionId: this.tripId!,
      ids: [entity.id],
      id: assigneeId || entity.assignedToId,
      deadlineAt: getNowDaysUtc(new Date(), this.deadlineDays()),
    };

    if (!transport.id) {
      throw new Error('Assignee Id is null');
    }

    const assign = reassignAllowed ? !!assigneeId : !entity.assignedToId;
    const operation$ = assign
      ? this.tripSharedExpenseService.assign(transport)
      : this.tripSharedExpenseService.unassign(transport);

    operation$.pipe(
      switchMap(() => this.target()?.id
        ? this.tripSharedExpenseService.getAllForAssignee(this.tripId!, this.target()!.id!)
        : this.tripSharedExpenseService.getAll(this.tripId!)),
      map((expenses: TripSharedExpenseDto[]) => {
        expenses.forEach(expense => this.generateStatusData(expense, this.lookup));
        return expenses;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((expenses) => {
      this.componentService.updateEntities(expenses);
    });
  }

  targetEntityButtonClick(entity: TripSharedExpenseDto): void {
    const target = this.target();
    this.assignOrUnassign(entity, target!.id!, false);
  }

  toggleAcceptClick(entity: TripSharedExpenseDto): void {
    const transport = {
      id: entity.id,
      tripId: this.tripId!,
    };
    this.tripSharedExpenseService.toggleAccept(transport).pipe(
      switchMap(() => this.target()?.id
        ? this.tripSharedExpenseService.getAllForAssignee(this.tripId!, this.target()!.id!)
        : this.tripSharedExpenseService.getAll(this.tripId!)),
      map((expenses: TripSharedExpenseDto[]) => {
        expenses.forEach(expense => this.generateStatusData(expense, this.lookup));
        return expenses;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((expenses) => {
      this.componentService.updateEntities(expenses);
    });
  }

  toggleRejectClick(entity: TripSharedExpenseDto): void {
    const transport = {
      id: entity.id,
      tripId: this.tripId!,
    };
    this.tripSharedExpenseService.toggleReject(transport).pipe(
      switchMap(() => this.target()?.id
        ? this.tripSharedExpenseService.getAllForAssignee(this.tripId!, this.target()!.id!)
        : this.tripSharedExpenseService.getAll(this.tripId!)),
      map((expenses: TripSharedExpenseDto[]) => {
        expenses.forEach(expense => this.generateStatusData(expense, this.lookup));
        return expenses;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((expenses) => {
      this.componentService.updateEntities(expenses);
    });
  }

  private downloadExpensesPdf(): void {
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.documentsService.getTripExpensesReportPdf(this.tripId).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trip-expenses-${this.tripId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}