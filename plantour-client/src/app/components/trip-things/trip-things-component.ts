import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CrudService, FromDicService, MultipleIdsRequest, PackingService } from '../../services/crud-service';
import { TripThingDto, CreateTripThingRequest, UpdateTripThingRequest, TripThingService } from '../../services/trip-thing-service';
import { ActivatedRoute, Router } from '@angular/router';
import { TripPackageDto, TripPackageService } from '../../services/trip-package-service';
import { TripThingItemComponent } from './trip-thing-item/trip-thing-item-component';
import { CurrentTripService } from '../../services/current-trip-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { Condition, DynamicQueryService, Target, TargetCondition, TargetMode } from '../../services/dynamic-query-service';
import { map, switchMap, tap } from 'rxjs';
import { AssignmentStatus } from '../../helpers/enums';
import { formatDate, getDaysDifference } from '../../helpers/utils';

// TODO: fix access to view, delete  or edit if no initial rows
// TODO: do not show shared info for not shared things and hide show shared menг if no shared things
// TODO: categories lookup?
@Component({
  selector: 'app-trip-things',
  standalone: true,
  imports: [
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent
  ],
  templateUrl: './trip-things-component.html',
  styleUrl: './trip-things-component.scss',
})
export class TripThingsComponent implements OnInit {
  tripThingItemComponent = TripThingItemComponent;
  componentId = 'trip-things';
  componentService = inject(ComponentService);
  tripThingService = inject(TripThingService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(DynamicQueryService);
  tripPackageService = inject(TripPackageService);
  targetCondition = toSignal(this.componentService.targetCondition$);
  target = toSignal(this.componentService.target$);
  targetedIds = toSignal(this.componentService.targetedIds$);
  notTargetedIds = toSignal(this.componentService.notTargetedIds$);
  currentTripService = inject(CurrentTripService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private tripId: string | null = null;


  assignmentsVisible = signal<boolean>(true);
  packsVisible = signal<boolean>(true);

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
          label: (this.packsVisible() ? 'Hide' : 'Show') + ' Packs',
          icon: 'box',
          action: () => {
            this.packsVisible.set(!this.packsVisible());
            this.localStorageService.setComponentKey(this.componentId, 'packsVisible', this.packsVisible());
          }
        }
      ];
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
        label: 'Trip pack',
        icon: 'box',
        target: null
      },
      {
        kind: 'filter',
        property: 'name',
        label: 'Filter by Name',
        filterText: '',
        comparisonType: 'contains',
        icon: 'filter'
      }
    ];

  itemMetaData: any = {
    packOrUnpack: this.packOrUnpack.bind(this),
    packsVisible: this.packsVisible,
    assignmentsVisible: this.assignmentsVisible,
    toggleFinished: this.toggleFinishedClick.bind(this)
  }



  ngOnInit(): void {

    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');

    // The checkTripIdGuard should ensure this never happens
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.tripPackageService.getAll(this.tripId).pipe(
      tap((packs: TripPackageDto[]) => {
        this.initConditions(this.componentId, packs);
        this.initTargetLookup(packs);
        this.initSavedFeatures();
      }),
      switchMap(_ =>
        this.componentService.target$.pipe(
          switchMap((target: Target | null) => {
            if (target && target.id) {
              return this.tripThingService.getAllForPackage(this.tripId!, target.id);
            }
            return this.tripThingService.getAll(this.tripId!);
          }),
          map((tripThings: TripThingDto[]) => {
            tripThings.forEach(ts => {
              this.generateMessagesData(ts);
            });
            return tripThings;
          })
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(tripThings =>
      this.componentService.updateEntities(tripThings || [])
    );
  }

  initSavedFeatures() {
    const v = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    const id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    this.componentService.updateSelectedId(id);

    const packsVisible = this.localStorageService.getComponentKey(this.componentId, 'packsVisible');
    this.packsVisible.set(packsVisible);

    const assignmentsVisible = this.localStorageService.getComponentKey(this.componentId, 'assignmentsVisible');
    this.assignmentsVisible.set(assignmentsVisible);
  }

  initTargetLookup(packs: TripPackageDto[] | null) {

    if (!packs) {
      this.componentService.updateTargetLookup([]);
      return;
    }

    const lookup = (packs).sort((a, b) => a.name.localeCompare(b.name)).map((t: any) => ({
      id: t.id,
      name: t.name
    }));

    this.componentService.updateTargetLookup(lookup);
    this.itemMetaData.packs = lookup;
  }

  initConditions(componentId: string | null, packs: TripPackageDto[] | null = null): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }
    const savedConditions = this.localStorageService.getComponentKeyObject(componentId, 'conditions') || [];
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);
    const targetCondition: TargetCondition | undefined = initialConditions.find(c => c.kind === 'target');

    if (targetCondition) {

      const targetPackId = targetCondition.target?.id;
      // Ensure the target pack id is found in the packs list
      if (targetPackId) {
        const pack = packs?.find(p => p.id === targetPackId);
        if (pack) {
          targetCondition.target = {
            id: pack.id,
            name: pack.name
          };
        }
      } else {
        targetCondition.target = null;
      }
    }

    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }

  onAddTargetClick(): void {
    const targetId = this.target()?.id;

    if (!targetId) {
      throw new Error('Target Package Id is not set');
    }
    const ids = this.notTargetedIds();
    if (!ids || ids.length === 0) {
      throw new Error('No not targeted ids available');
    }
    const request: MultipleIdsRequest = {
      collectionId: this.tripId!,
      ids: ids,
      id: targetId
    };
    this.tripThingService.pack(request).pipe(
      switchMap(() => this.tripThingService.getAllForPackage(this.tripId!, targetId)),
      map((tripThings: TripThingDto[]) => {
        tripThings.forEach(ts => {
          this.generateMessagesData(ts);
        });
        return tripThings;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripThings) => {
      this.componentService.updateEntities(tripThings);
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
    this.tripThingService.unpack(request).pipe(
      switchMap(() => this.tripThingService.getAllForPackage(this.tripId!, targetId)),
      map((tripThings: TripThingDto[]) => {
        tripThings.forEach(ts => {
          this.generateMessagesData(ts);
        });
        return tripThings;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripThings) => {
      this.componentService.updateEntities(tripThings);
    });
  }

  deleteTripThing(id: string): void {
    this.tripThingService.delete(id, this.tripId!).pipe(

      switchMap(x => {
        return this.componentService.target$.pipe(
          switchMap(target => {
            const packageId = target?.id;
            if (packageId) {
              return this.tripThingService.getAllForPackage(this.tripId!, packageId);
            }
            return this.tripThingService.getAll(this.tripId!);
          })


        );
      }),
      map((tripThings: TripThingDto[]) => {
        tripThings.forEach(ts => {
          this.generateMessagesData(ts);
        });
        return tripThings;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripThings) => {
      this.componentService.updateEntities(tripThings);
    });
  }

  packOrUnpack(entity: any, packageId: string | null, repackAllowed: boolean): void {
    const request: MultipleIdsRequest = {
      collectionId: this.tripId!,
      ids: [entity.id],
      id: packageId!
    };

    const pack: boolean = repackAllowed ? !!packageId : !entity.isTargeted;
    const o = pack ? this.tripThingService.pack(request) : this.tripThingService.unpack(request);

    o.pipe(
      switchMap(() => this.target()?.id ? this.tripThingService.getAllForPackage(this.tripId!, this.target()!.id!) : this.tripThingService.getAll(this.tripId!)),
      map((tripThings: TripThingDto[]) => {
        tripThings.forEach(ts => {
          this.generateMessagesData(ts);
        });
        return tripThings;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripThings) => {
      this.componentService.updateEntities(tripThings);
    });
  }

  targetEntityButtonClick(entity: any): void {
    const target = this.target();
    this.packOrUnpack(entity, target?.id || null, false);
  }


  generateMessagesData = (thing: TripThingDto) => {

    if (thing.packageName) {
      thing.packageText = `Packed in ${thing.packageName}`;
      if (thing.packageLabel) {
        thing.packageText += ` (${thing.packageLabel})`;
      }
    } else {
      thing.packageText = 'Not packed';
    }

    thing.assignmentStatus = AssignmentStatus.NotAssigned
    thing.assignmentStatusText = "Not shared";

    if (!thing.tripSharedThingId) {
      return;
    }

    const parts: string[] = [];

    if (thing.assignedAt) {
      parts.push(`Assigned on ${formatDate(thing.assignedAt)}`);
    }

    parts.push("Accepted");

    let deadlineString = "";
    if (thing.assignedDeadline) {
      const daysDiff = getDaysDifference(thing.assignedDeadline);
      if (daysDiff! < 0) {
        deadlineString = ` Deadline was: ${formatDate(thing.assignedDeadline)}, ${Math.abs(daysDiff!)} days ago.`;
      } else if (daysDiff == 0) {
        deadlineString = ` Deadline is today.`;
      } else {
        deadlineString = ` Deadline: ${formatDate(thing.assignedDeadline)} in ${daysDiff} days.`;
      }
    }

    if (thing.finished) {

      if (thing.finished === 'success') {
        parts.push("Finished successfully");
        thing.assignmentStatus = AssignmentStatus.FinishedSuccess;
        thing.assignmentStatusText = parts.join('. ');
        return;
      }

      if (thing.finished === 'failure') {
        parts.push("Finished and failed");
        thing.assignmentStatus = AssignmentStatus.FinishedFailure;
        if (deadlineString) {
          parts.push(deadlineString);
        }
        thing.assignmentStatusText = parts.join('. ');
        return;
      }
    }


    thing.assignmentStatus = AssignmentStatus.AssignedNotFinished;
    parts.push("Not finished yet");
    if (deadlineString) {
      parts.push(deadlineString);
    }
    thing.assignmentStatusText = parts.join('. ');
  };

  toggleFinishedClick(entity: TripThingDto): void {
    const transport = {
      id: entity.id,
      tripId: this.tripId!,
      finished: entity.finished
    }
    this.tripThingService.toggleFinished(transport).pipe(
      switchMap(() => this.target()?.id ? this.tripThingService.getAllForPackage(this.tripId!, this.target()!.id!) : this.tripThingService.getAll(this.tripId!)),
      map((tripThings: TripThingDto[]) => {
        tripThings.forEach(ts => {
          this.generateMessagesData(ts);
        });
        return tripThings;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripThings) => {
      this.componentService.updateEntities(tripThings);
    });

  }



}