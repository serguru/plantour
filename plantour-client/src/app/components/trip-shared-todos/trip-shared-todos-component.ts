import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { CurrentTripService } from '../../services/current-trip-service';
import { TripUserDto, TripUserService } from '../../services/trip-user-service';
import { Condition, DynamicQueryService, Target, TargetCondition } from '../../services/dynamic-query-service';
import { MultipleIdsRequest } from '../../services/crud-service';
import { AssignmentStatus } from '../../helpers/enums';
import { findDuplicates, formatDate, getDaysDifference, getFullName, getFutureDate, getNowDaysUtc } from '../../helpers/utils';
import { TripSharedTodoDto, TripSharedTodoService } from '../../services/trip-shared-todo-service';
import { TripSharedTodoItemComponent } from './trip-shared-todo-item/trip-shared-todo-item-component';

@Component({
  selector: 'app-trip-shared-todos',
  standalone: true,
  imports: [
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent,
    FormsModule,
    InputNumber,
  ],
  templateUrl: './trip-shared-todos-component.html',
  styleUrl: './trip-shared-todos-component.scss',
})
export class TripSharedTodosComponent implements OnInit {
  tripSharedTodoItemComponent = TripSharedTodoItemComponent;
  componentId = 'trip-shared-todos';
  currentTripUserId: string | null = null;

  formatDate = formatDate;

  deadlineDays = signal<number>(1);

  messagesService = inject(MessagesService);
  componentService = inject(ComponentService);
  tripSharedTodoService = inject(TripSharedTodoService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(DynamicQueryService);
  usersService = inject(UsersService);

  isParticipant = this.usersService.isParticipantSignal;

  targetCondition = toSignal(this.componentService.targetCondition$);
  target = toSignal(this.componentService.target$);
  targetedIds = toSignal(this.componentService.targetedIds$);
  notTargetedIds = toSignal(this.componentService.notTargetedIds$);

  currentTripService = inject(CurrentTripService);
  tripUserService = inject(TripUserService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private tripId: string | null = null;

  showCalendarForDeadline = computed(() => {
    if (this.isParticipant()) {
      return false;
    }
    if (this.assigneesVisible()) {
      return true;
    }
    return !!this.targetCondition();
  });

  assigneesVisible = signal<boolean>(true);
  assignmentsVisible = signal<boolean>(true);

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
        label: 'Help',
        icon: 'question-circle',
        action: () => {
          this.router.navigate(['/help/todos/shared-todos-intro']);
        },
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
  ];

  itemMetaData: any = {
    assignOrUnassign: this.assignOrUnassign.bind(this),
    assigneesVisible: this.assigneesVisible,
    assignmentsVisible: this.assignmentsVisible,
    toggleAccept: this.toggleAcceptClick.bind(this),
    toggleReject: this.toggleRejectClick.bind(this),
  };

  lookup: any[] = [];

  onModelChangeDays(): void {
    this.localStorageService.setComponentKey(this.componentId, 'deadlineDays', this.deadlineDays());
  }

  featureDate = computed<string>(() => {
    const days = this.deadlineDays();
    if (days === null) {
      return '';
    }
    return formatDate(getFutureDate(days));
  });

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
              return this.tripSharedTodoService.getAllForAssignee(this.tripId!, target.id);
            }
            return this.tripSharedTodoService.getAll(this.tripId!);
          }),
          map((tripSharedTodos: TripSharedTodoDto[]) => {
            tripSharedTodos.forEach(todo => this.generateStatusData(todo, lookup));
            return tripSharedTodos;
          })
        )
      ),
      tap((tripSharedTodos: TripSharedTodoDto[]) => {
        this.initSavedFeatures(tripSharedTodos);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripSharedTodos) => this.componentService.updateEntities(tripSharedTodos || []));
  }

  initSavedFeatures(items: TripSharedTodoDto[]) {
    const actionsVisible = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(actionsVisible);

    let id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    if (!items || !items.find(x => x.id === id)) {
      id = null;
    }
    this.componentService.updateSelectedId(id);

    const assigneesVisible = this.localStorageService.getComponentKey(this.componentId, 'assigneesVisible');
    this.assigneesVisible.set(!!assigneesVisible);

    const assignmentsVisible = this.localStorageService.getComponentKey(this.componentId, 'assignmentsVisible');
    this.assignmentsVisible.set(!!assignmentsVisible);

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

  generateStatusData = (sharedTodo: TripSharedTodoDto, usersLookup: any[]) => {
    sharedTodo.currentUserCanAcceptOrReject = !!(sharedTodo.assignedToId && sharedTodo.assignedToId === this.currentTripUserId);

    if (!sharedTodo.assignedToId) {
      sharedTodo.assignmentStatusText = 'Awaiting assignment';
      sharedTodo.assignmentStatus = AssignmentStatus.NotAssigned;
      sharedTodo.assignmentStatusName = 'Not Assigned';
      return;
    }

    const assignee = usersLookup.find((a: any) => a.id === sharedTodo.assignedToId);
    if (!assignee) {
      throw new Error('Assignee not found');
    }

    sharedTodo.assigneeFullName = assignee.name;
    sharedTodo.assignmentStatus = AssignmentStatus.AssignedNotFinished;
    sharedTodo.assignmentStatusName = 'Assigned, Not Finished';

    let deadlineString = '';
    if (sharedTodo.assignedDeadline) {
      const daysDiff = getDaysDifference(sharedTodo.assignedDeadline);
      if (daysDiff! < 0) {
        deadlineString = ` Deadline was: ${formatDate(sharedTodo.assignedDeadline)}, ${Math.abs(daysDiff!)} days ago.`;
        sharedTodo.assignmentStatus = AssignmentStatus.FinishedFailure;
        sharedTodo.assignmentStatusName = 'Finished, Failed';
      } else if (daysDiff === 0) {
        deadlineString = ' Deadline is today.';
      } else {
        deadlineString = ` Deadline: ${formatDate(sharedTodo.assignedDeadline)} in ${daysDiff} days.`;
      }
    }

    sharedTodo.assignmentStatusText = `Assigned to ${assignee.name}`;
    if (sharedTodo.assignedAt) {
      sharedTodo.assignmentStatusText += ` on ${formatDate(sharedTodo.assignedAt)}`;
    }
    sharedTodo.assignmentStatusText += '.';

    if (sharedTodo.assignedTodoId) {
      sharedTodo.assignmentStatusText += ' Accepted.';
    }

    if (sharedTodo.assigneeFinished === 'success') {
      sharedTodo.assignmentStatusText += ' Finished successfully.';
      sharedTodo.assignmentStatus = AssignmentStatus.FinishedSuccess;
      sharedTodo.assignmentStatusName = 'Finished, Success';
    } else if (sharedTodo.assigneeFinished === 'failure') {
      sharedTodo.assignmentStatusText += ' Finished and failed.';
      sharedTodo.assignmentStatus = AssignmentStatus.FinishedFailure;
      sharedTodo.assignmentStatusName = 'Finished, Failed';
    }

    if (sharedTodo.rejected) {
      sharedTodo.assignmentStatusText += ' Rejected.';
      sharedTodo.assignmentStatus = AssignmentStatus.FinishedFailure;
      sharedTodo.assignmentStatusName = 'Finished, Failed';
    }

    sharedTodo.assignmentStatusText += deadlineString;
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

    this.tripSharedTodoService.assign(transport).pipe(
      switchMap(() => this.tripSharedTodoService.getAllForAssignee(this.tripId!, targetId)),
      map((tripSharedTodos: TripSharedTodoDto[]) => {
        tripSharedTodos.forEach(todo => this.generateStatusData(todo, this.lookup));
        return tripSharedTodos;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripSharedTodos) => {
      this.componentService.updateEntities(tripSharedTodos);
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

    this.tripSharedTodoService.unassign(request).pipe(
      switchMap(() => this.tripSharedTodoService.getAllForAssignee(this.tripId!, targetId)),
      map((tripSharedTodos: TripSharedTodoDto[]) => {
        tripSharedTodos.forEach(todo => this.generateStatusData(todo, this.lookup));
        return tripSharedTodos;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripSharedTodos) => {
      this.componentService.updateEntities(tripSharedTodos);
    });
  }

  deleteTripTodo(id: string): void {
    this.tripSharedTodoService.delete(id, this.tripId!).pipe(
      switchMap(() => this.componentService.target$),
      switchMap((target) => {
        if (target?.id) {
          return this.tripSharedTodoService.getAllForAssignee(this.tripId!, target.id);
        }
        return this.tripSharedTodoService.getAll(this.tripId!);
      }),
      map((tripSharedTodos: TripSharedTodoDto[]) => {
        tripSharedTodos.forEach(todo => this.generateStatusData(todo, this.lookup));
        return tripSharedTodos;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripSharedTodos) => {
      this.componentService.updateEntities(tripSharedTodos);
    });
  }

  assignOrUnassign(entity: TripSharedTodoDto, assigneeId: string | null, reassignAllowed = true): void {
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
      ? this.tripSharedTodoService.assign(transport)
      : this.tripSharedTodoService.unassign(transport);

    operation$.pipe(
      switchMap(() => this.target()?.id
        ? this.tripSharedTodoService.getAllForAssignee(this.tripId!, this.target()!.id!)
        : this.tripSharedTodoService.getAll(this.tripId!)),
      map((tripSharedTodos: TripSharedTodoDto[]) => {
        tripSharedTodos.forEach(todo => this.generateStatusData(todo, this.lookup));
        return tripSharedTodos;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripSharedTodos) => {
      this.componentService.updateEntities(tripSharedTodos);
    });
  }

  targetEntityButtonClick(entity: TripSharedTodoDto): void {
    const target = this.target();
    this.assignOrUnassign(entity, target!.id!, false);
  }

  toggleAcceptClick(entity: TripSharedTodoDto): void {
    const transport = {
      id: entity.id,
      tripId: this.tripId!,
    };
    this.tripSharedTodoService.toggleAccept(transport).pipe(
      switchMap(() => this.target()?.id
        ? this.tripSharedTodoService.getAllForAssignee(this.tripId!, this.target()!.id!)
        : this.tripSharedTodoService.getAll(this.tripId!)),
      map((tripSharedTodos: TripSharedTodoDto[]) => {
        tripSharedTodos.forEach(todo => this.generateStatusData(todo, this.lookup));
        return tripSharedTodos;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripSharedTodos) => {
      this.componentService.updateEntities(tripSharedTodos);
    });
  }

  toggleRejectClick(entity: TripSharedTodoDto): void {
    const transport = {
      id: entity.id,
      tripId: this.tripId!,
    };
    this.tripSharedTodoService.toggleReject(transport).pipe(
      switchMap(() => this.target()?.id
        ? this.tripSharedTodoService.getAllForAssignee(this.tripId!, this.target()!.id!)
        : this.tripSharedTodoService.getAll(this.tripId!)),
      map((tripSharedTodos: TripSharedTodoDto[]) => {
        tripSharedTodos.forEach(todo => this.generateStatusData(todo, this.lookup));
        return tripSharedTodos;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripSharedTodos) => {
      this.componentService.updateEntities(tripSharedTodos);
    });
  }
}