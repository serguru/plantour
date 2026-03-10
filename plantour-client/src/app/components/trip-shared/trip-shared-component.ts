import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MultipleIdsRequest } from '../../services/crud-service';
import { TripSharedDto, TripSharedService } from '../../services/trip-shared-service';
import { ActivatedRoute, Router } from '@angular/router';
import { TripSharedItemComponent } from './trip-shared-item/trip-shared-item-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { TripService } from '../../services/trip-service';
import { ComponentService } from '../../services/component-service';
import { map, switchMap, tap } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage-service';
import { Condition, DynamicQueryService, Target, TargetCondition } from '../../services/dynamic-query-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CurrentTripService } from '../../services/current-trip-service';
import { TripUserDto, TripUserService } from '../../services/trip-user-service';
import { findDuplicates, formatDate, getDaysDifference, getFullName, getFutureDate, getNowDaysUtc } from '../../helpers/utils';
import { FormsModule } from '@angular/forms';
import { InputNumber } from "primeng/inputnumber";
import { MessagesService } from '../../services/messages-service';
import { UsersService } from '../../services/users-service';
import { AssignmentStatus } from '../../helpers/enums';


// TODO: fix category show/hide and location
// TODO: add a link to shared item from trip item
@Component({
  selector: 'app-trip-shared',
  standalone: true,
  imports: [
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent,
    FormsModule,
    InputNumber
  ],
  templateUrl: './trip-shared-component.html',
  styleUrl: './trip-shared-component.scss'
})
export class TripSharedComponent implements OnInit {
  tripSharedItemComponent = TripSharedItemComponent;
  componentId: string = 'trip-shared';
  currentTripUserId: string | null = null;

  formatDate = formatDate;

  deadlineDays = signal<number>(1);

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

  messagesService = inject(MessagesService);
  tripService = inject(TripService);
  componentService = inject(ComponentService);
  tripSharedService = inject(TripSharedService);
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
    const condition = this.targetCondition();
    return !!condition;
  });


  assigneesVisible = signal<boolean>(true);
  assignmentsVisible = signal<boolean>(true);

  assigneesLabel = computed(() =>
    (this.assigneesVisible() ? 'Hide' : 'Show') + ' Assignees'
  );

  menuItems = computed<MenuConfig[]>(() => {

    const result =
      [
        {
          label: (this.assignmentsVisible() ? 'Hide' : 'Show') + ' Assignments',
          icon: 'check',
          action: () => {
            this.assignmentsVisible.set(!this.assignmentsVisible());
            this.localStorageService.setComponentKey(this.componentId, 'assignmentsVisible', this.assignmentsVisible());
          }
        },
        {
          label: 'Help',
          icon: 'question-circle',
          action: () => {
            this.router.navigate(['/help/shared-things/shared-intro']);
          }
        }
      ];

    if (!this.isParticipant()) {
      result.unshift({
        label: this.assigneesLabel(),
        icon: 'users',
        action: () => {
          const v = this.assigneesVisible();
          this.assigneesVisible.set(!v);
          if (!v && this.targetCondition()) {
            this.messagesService.showWarning('Changing assignees visibility will have no effect while a Trip participant is selected');
          }
          this.localStorageService.setComponentKey(this.componentId, 'assigneesVisible', this.assigneesVisible());
        }
      });
    }

    return result;
  }
  );


  conditions: Condition[] =
    [
      {
        kind: 'sort',
        label: 'Sort by Name',
        icon: 'sort-alt',
        property: 'name',
        sortType: 'text',
        direction: 'none'
      },
      {
        kind: 'target',
        label: 'Trip participant',
        icon: 'shopping-bag',
        target: null
      },
      {
        kind: 'filter',
        property: 'name',
        label: 'Filter by Name',
        filterText: '',
        comparisonType: 'contains',
        icon: 'filter'
      },
      {
        kind: 'filter',
        property: 'assignmentStatusName',
        label: 'Assignment Status',
        filterText: '',
        comparisonType: 'exact',
        icon: 'filter'
      },
      {
        kind: 'filter',
        property: 'assigneeFullName',
        label: 'Assignee Full Name',
        filterText: '',
        comparisonType: 'exact',
        icon: 'filter'
      },
      {
        kind: 'filter',
        property: 'category',
        label: 'Category',
        filterText: '',
        comparisonType: 'exact',
        icon: 'filter'
      }
    ];

  itemMetaData: any = {
    assignOrUnassign: this.assignOrUnassign.bind(this),
    assigneesVisible: this.assigneesVisible,
    assignmentsVisible: this.assignmentsVisible,
    toggleAccept: this.toggleAcceptClick.bind(this),
    toggleReject: this.toggleRejectClick.bind(this)
  }


  generateStatusData = (sharedThing: TripSharedDto, usersLookup) => {

    sharedThing.currentUserCanAcceptOrReject = !!(sharedThing.assignedToId && sharedThing.assignedToId === this.currentTripUserId);

    if (!sharedThing.assignedToId) {
      sharedThing.assignmentStatusText = "Awaiting assignment";
      sharedThing.assignmentStatus = AssignmentStatus.NotAssigned;
      sharedThing.assignmentStatusName = "Not Assigned";
      return;
    }

    const assignee = usersLookup.find((a: any) => a.id === sharedThing.assignedToId);
    if (!assignee) {
      throw new Error('Assignee not found');
    }

    sharedThing.assigneeFullName = assignee.name;
    sharedThing.assignmentStatus = AssignmentStatus.AssignedNotFinished
    sharedThing.assignmentStatusName = "Assigned, Not Finished";

    let deadlineString = "";

    if (sharedThing.assignedDeadline) {
      const daysDiff = getDaysDifference(sharedThing.assignedDeadline);

      if (daysDiff! < 0) {
        deadlineString = ` Deadline was: ${formatDate(sharedThing.assignedDeadline)}, ${Math.abs(daysDiff!)} days ago.`;
        sharedThing.assignmentStatus = AssignmentStatus.FinishedFailure;
        sharedThing.assignmentStatusName = "Finished, Failed";
      } else if (daysDiff == 0) {
        deadlineString = ` Deadline is today.`;
      } else {
        deadlineString = ` Deadline: ${formatDate(sharedThing.assignedDeadline)} in ${daysDiff} days.`;
      }
    }

    sharedThing.assignmentStatusText = "Assigned to " + assignee.name;

    if (sharedThing.assignedAt) {
      sharedThing.assignmentStatusText += ` on ${formatDate(sharedThing.assignedAt)}`
    }

    sharedThing.assignmentStatusText += ".";

    if (sharedThing.assignedThingId) {
      sharedThing.assignmentStatusText += " Accepted.";
    }

    if (sharedThing.assigneeFinished) {

      if (sharedThing.assigneeFinished === 'success') {
        sharedThing.assignmentStatusText += " Finished successfully.";
        sharedThing.assignmentStatus = AssignmentStatus.FinishedSuccess;
        sharedThing.assignmentStatusName = "Finished, Success";
      } else if (sharedThing.assigneeFinished === 'failure') {
        sharedThing.assignmentStatusText += " Finished and failed.";
        sharedThing.assignmentStatus = AssignmentStatus.FinishedFailure;
        sharedThing.assignmentStatusName = "Finished, Failed";
      } else {
        throw new Error("Unsupported finish result encountered")
      }
    }


    if (sharedThing.rejected) {
      sharedThing.assignmentStatusText += " Rejected. ";
      sharedThing.assignmentStatus = AssignmentStatus.FinishedFailure;
      sharedThing.assignmentStatusName = "Finished, Failed";
    }
    sharedThing.assignmentStatusText += deadlineString;

  };

  lookup: any[] = [];

  ngOnInit(): void {

    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');

    // The checkTripIdGuard should ensure this never happens
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.tripUserService.getAll(this.tripId).pipe(
      map((tripUsers: TripUserDto[]) => {
        const currentUserId = this.usersService.getCurrentUserId();
        this.currentTripUserId = tripUsers.find(x => x.userId === currentUserId)?.id ?? null;
        this.lookup = this.initTargetLookup(tripUsers);
        this.initConditions(this.componentId, tripUsers, this.lookup);
        this.initSavedFeatures();
        return this.lookup;
      }),
      switchMap(lookup =>
        this.componentService.target$.pipe(
          switchMap((target: Target | null) => {
            if (target && target.id) {
              return this.tripSharedService.getAllForAssignee(this.tripId!, target.id);
            }
            return this.tripSharedService.getAll(this.tripId!);
          }),

          map((tripShareds: TripSharedDto[]) => {
            tripShareds.forEach(ts => {
              this.generateStatusData(ts, lookup);
            });
            return tripShareds;
          })
        ),
      ),

      takeUntilDestroyed(this.destroyRef)
    ).subscribe(tripShareds =>
      this.componentService.updateEntities(tripShareds || [])
    );
  }

  initSavedFeatures() {
    const v = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    const id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
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

    users.forEach((x: TripUserDto) => {
      const isDuplicated = duplicatedIds.some(y => y === x.id);
      const name = getFullName(x.firstName ?? null, x.lastName ?? null, x.email, isDuplicated);
      lookup.push({
        id: x.id,
        name: name
      });
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
              name: lookup.find(l => l.id === tripUser.id)?.name || 'No User Name'
            };
          }
        } else {
          targetCondition.target = null;
        }
      }
    } else {
      // remove target condition for participants
      const index = initialConditions.findIndex(c => c.kind === 'target');
      if (index !== -1) {
        initialConditions.splice(index, 1);
      }
    }

    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }

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

    
    const deadlineAt = getNowDaysUtc(new Date(), this.deadlineDays());

    const transport = {
      collectionId: this.tripId!,
      ids: ids,
      id: targetId,
      deadlineAt: deadlineAt
    }

    this.tripSharedService.assign(transport).pipe(
      switchMap(() => this.tripSharedService.getAllForAssignee(this.tripId!, targetId)),
      map((tripShareds: TripSharedDto[]) => {
        tripShareds.forEach(ts => {
          this.generateStatusData(ts, this.lookup);
        });
        return tripShareds;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripSharedThings) => {
      this.componentService.updateEntities(tripSharedThings);
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
      ids: ids,
      id: targetId
    };
    this.tripSharedService.unassign(request).pipe(
      switchMap(() => this.tripSharedService.getAllForAssignee(this.tripId!, targetId)),
      map((tripShareds: TripSharedDto[]) => {
        tripShareds.forEach(ts => {
          this.generateStatusData(ts, this.lookup);
        });
        return tripShareds;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripSharedThings) => {
      this.componentService.updateEntities(tripSharedThings);
    });
  }

  deleteTripThing(id: string): void {
    this.tripSharedService.delete(id, this.tripId!).pipe(

      switchMap(x => {
        return this.componentService.target$.pipe(
          switchMap(target => {
            const packageId = target?.id;
            if (packageId) {
              return this.tripSharedService.getAllForAssignee(this.tripId!, packageId);
            }
            return this.tripSharedService.getAll(this.tripId!);
          })
        );
      }),
      map((tripShareds: TripSharedDto[]) => {
        tripShareds.forEach(ts => {
          this.generateStatusData(ts, this.lookup);
        });
        return tripShareds;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripSharedThings) => {
      this.componentService.updateEntities(tripSharedThings);
    });
  }

  assignOrUnassign(entity: TripSharedDto, assigneeId: string | null, reassignAllowed: boolean = true): void {

    const deadlineAt = getNowDaysUtc(new Date(), this.deadlineDays());
    const transport = {
      collectionId: this.tripId!,
      ids: [entity.id],
      id: assigneeId || entity.assignedToId,
      deadlineAt: deadlineAt
    }

    if (!transport.id) {
      throw new Error('Assignee Id is null');
    }

    const assign: boolean = reassignAllowed ? !!assigneeId : !entity.assignedToId;

    const o = assign ? this.tripSharedService.assign(transport) : this.tripSharedService.unassign(transport);

    o.pipe(
      switchMap(() => this.target()?.id ? this.tripSharedService.getAllForAssignee(this.tripId!, this.target()!.id!) : this.tripSharedService.getAll(this.tripId!)),
      map((tripShareds: TripSharedDto[]) => {
        tripShareds.forEach(ts => {
          this.generateStatusData(ts, this.lookup);
        });
        return tripShareds;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripSharedThings) => {
      this.componentService.updateEntities(tripSharedThings);
    });
  }

  targetEntityButtonClick(entity: any): void {
    const target = this.target();
    this.assignOrUnassign(entity, target!.id!, false);
  }

  toggleAcceptClick(entity: TripSharedDto): void {
    if (!this.isParticipant) {
      throw new Error('Only participant can toggle accept')
    }
    const transport = {
      id: entity.id,
      tripId: this.tripId!
    }
    this.tripSharedService.toggleAccept(transport).pipe(
      switchMap(() => this.target()?.id ? this.tripSharedService.getAllForAssignee(this.tripId!, this.target()!.id!) : this.tripSharedService.getAll(this.tripId!)),
      map((tripShareds: TripSharedDto[]) => {
        tripShareds.forEach(ts => {
          this.generateStatusData(ts, this.lookup);
        });
        return tripShareds;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripSharedThings) => {
      this.componentService.updateEntities(tripSharedThings);
    });

  }

  toggleRejectClick(entity: TripSharedDto): void {

    if (!this.isParticipant) {
      throw new Error('Only participant can toggle reject')
    }

    const transport = {
      id: entity.id,
      tripId: this.tripId!
    }
    this.tripSharedService.toggleReject(transport).pipe(
      switchMap(() => this.target()?.id ? this.tripSharedService.getAllForAssignee(this.tripId!, this.target()!.id!) : this.tripSharedService.getAll(this.tripId!)),
      map((tripShareds: TripSharedDto[]) => {
        tripShareds.forEach(ts => {
          this.generateStatusData(ts, this.lookup);
        });
        return tripShareds;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripSharedThings) => {
      this.componentService.updateEntities(tripSharedThings);
    });
  }


}