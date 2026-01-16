import { Component, DestroyRef, inject } from '@angular/core';
import { MultipleIdsRequest } from '../../services/crud-service';
import { ThingService } from '../../services/thing-service';
import { TripThingService } from '../../services/trip-thing-service';
import { ThingItemComponent } from './things-item/thing-item-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader } from '../entities/entities-header-component/entities-header-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { AppService } from '../../services/app-service';
import { ComponentService } from '../../services/component-service';
import { TripDto, TripService } from '../../services/trip-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { TripSharedService } from '../../services/trip-shared-service';
import { Condition, Target, TargetCondition, TargetMode } from '../../services/dynamic-query-service';
import { UsersService } from '../../services/users-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { CurrentTripService } from '../../services/current-trip-service';

@Component({
  selector: 'app-things',
  imports: [
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent
  ],
  templateUrl: './things-component.html',
  styleUrl: './things-component.scss',
})
export class ThingsComponent {
  thingItemComponent = ThingItemComponent;
  componentId: string = 'things';
  appService = inject(AppService);
  tripService = inject(TripService);

  componentService = inject(ComponentService);
  thingService = inject(ThingService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(ComponentService).dynamicQueryService;
  tripThingService = inject(TripThingService);
  tripSharedService = inject(TripSharedService);

  targetCondition = toSignal(this.componentService.targetCondition$);
  target = toSignal(this.componentService.target$);

  targetedIds = toSignal(this.componentService.targetedIds$);
  notTargetedIds = toSignal(this.componentService.notTargetedIds$);
  
  usersService = inject(UsersService);

  currentTripService = inject(CurrentTripService);
  currentTripDtoSignal = toSignal(this.currentTripService.currentTripDto$, { initialValue: null });


  private destroyRef = inject(DestroyRef);

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
        label: 'Trip things',
        icon: 'compass',
        target: null
      },
      {
        kind: 'filter',
        property: 'category',
        label: 'Category',
        filterText: '',
        comparisonType: 'exact',
        icon: 'folder-open'
      }, {
        kind: 'filter',
        property: 'name',
        label: 'Filter by Name',
        filterText: '',
        comparisonType: 'contains',
        isSelected: true,
        icon: 'box'
      }
    ];

  ngOnInit(): void {

    this.componentService.reset();
    this.componentService.updateComponentId(this.componentId);

    var o = this.usersService.isAdminSignal() ? this.tripService.getAll() : this.tripService.getAllWhereParticipant();

    o.pipe(
      tap((trips: TripDto[]) => {
        this.initConditions(this.componentId, trips);
        this.initTargetLookup(trips);
        this.initSavedFeatures();
      }),
      switchMap(_ =>
        this.componentService.target$.pipe(
          switchMap((target: Target | null) => {
            if (target && target.selectedMode === TargetMode.TripShared) {
              return this.thingService.getAllForSharedTrip(target.id!);
            }
            if (target && target?.id) {
              return this.thingService.getAllForTrip(target.id);
            }
            return this.thingService.getAll();
          }),
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(things =>
      this.componentService.updateEntities(things || [])
    );
  }

  initSavedFeatures() {
    const v = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    const id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    this.componentService.updateSelectedId(id);
  }

  initTargetLookup(trips: TripDto[] | null) {

    if (!trips) {
      this.componentService.updateTargetLookup([]);
      return;
    }

    const lookup = (trips).sort((a, b) => {
      const aDate = a.startDate ?? '';
      const bDate = b.startDate ?? '';
      return aDate.localeCompare(bDate);
    }).map((t: TripDto) => {

      const result: Target = {
        id: t.id,
        name: t.name,
        selectedMode: null,
        options: null
      }

      if (this.usersService.isAdminSignal()) {
        result.selectedMode = TargetMode.TripShared;
        result.options = [
          {
            label: 'Shared',
            mode: TargetMode.TripShared
          }
        ];

        if (t.currentUserIncluded) {
          result.options.push({
            label: 'Own',
            mode: TargetMode.TripThings

          })
        }
      }
      return result;
    });

    this.componentService.updateTargetLookup(lookup);
  }

  getTargetByTrip(trip: TripDto) {
    const result: Target = {
      id: trip.id,
      name: trip.name,
      selectedMode: null,
      options: null
    }
    if (this.usersService.isAdminSignal()) {
      result.selectedMode = TargetMode.TripShared;
      result.options = [
        {
          label: 'Shared',
          mode: TargetMode.TripShared
        }
      ];
      if (trip.currentUserIncluded) {
        result.options.push({
          label: 'Own',
          mode: TargetMode.TripThings
        })
      }
    }
    return result;
  }

  initConditions(componentId: string | null, trips: TripDto[] | null = null): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }
    const savedConditions = this.localStorageService.getComponentKeyObject(componentId, 'conditions') || [];
    const savedTargetCondition: TargetCondition | undefined = savedConditions.find(c => c.kind === 'target');
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);
    const targetCondition: TargetCondition | undefined = initialConditions.find(c => c.kind === 'target');

    if (targetCondition) {
      const trip = trips?.find(t => t.id === targetCondition.target?.id);
      if (trip) {
        targetCondition.target = this.getTargetByTrip(trip);
      } else {
        const trip = this.currentTripDtoSignal();
        if (trip && trips?.find(t => t.id === trip.id)) {
          targetCondition.target = this.getTargetByTrip(trip);
        }
      }

      if (savedTargetCondition?.target?.selectedMode && targetCondition.target?.options?.map(x => x.mode).includes(savedTargetCondition.target.selectedMode)) {
        targetCondition.target.selectedMode = savedTargetCondition.target.selectedMode;
      };
    }

    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }

  onAddTargetClick(): void {
    const target = this.target();
    const targetId = target?.id;

    if (!targetId) {
      throw new Error('Target Trip Id is not set');
    }
    const ids = this.notTargetedIds();
    if (!ids || ids.length === 0) {
      throw new Error('No not targeted ids available');
    }
    const request: MultipleIdsRequest = {
      collectionId: targetId,
      ids: ids
    };

    let o, m;

    if (target?.selectedMode === TargetMode.TripShared) {
      o = this.tripSharedService.addFromDic(request);
      m = this.thingService.getAllForSharedTrip(targetId);
    } else {
      o = this.tripThingService.addFromDic(request);
      m = this.thingService.getAllForTrip(targetId);
    }
    o.pipe(
      switchMap(() => m),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((things) => {
      this.componentService.updateEntities(things);
    });
  }

  onDeleteTargetClick(): void {


    const target = this.target();
    const targetId = target?.id;

    if (!targetId) {
      throw new Error('Target Trip Id is not set');
    }
    const ids = this.targetedIds();
    if (!ids || ids.length === 0) {
      throw new Error('No targeted ids available');
    }
    const request: MultipleIdsRequest = {
      collectionId: targetId,
      ids: ids
    };

    let o, m;

    if (target?.selectedMode === TargetMode.TripShared) {
      o = this.tripSharedService.deleteFromDic(request);
      m = this.thingService.getAllForSharedTrip(targetId);
    } else {
      o = this.tripThingService.deleteFromDic(request);
      m = this.thingService.getAllForTrip(targetId);
    }
    o.pipe(
      switchMap(() => m),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((things) => {
      this.componentService.updateEntities(things);
    });




    // const target = this.targetCondition();
    // const targetId = targetCondition?.target?.id;
    
    //   throw new Error('Target Id is not set');
    // }
    // const ids = this.targetedIds();
    // if (!ids || ids.length === 0) {
    //   throw new Error('No targeted ids available');
    // }
    // const request: MultipleIdsRequest = {
    //   collectionId: targetId,
    //   ids: ids
    // };
    // this.tripThingService.deleteFromDic(request).pipe(
    //   switchMap(() => this.thingService.getAllForTrip(targetId)),
    //   takeUntilDestroyed(this.destroyRef)
    // ).subscribe((things) => {
    //   this.componentService.updateEntities(things);
    // });
  }

  deleteThing(id: string): void {
    this.thingService.delete(id).pipe(

      switchMap(x => {
        return this.componentService.target$.pipe(
          switchMap(target => {
            const tripId = target?.id;
            if (tripId) {
              return this.thingService.getAllForTrip(tripId);
            }
            return this.thingService.getAll();
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((things) => {
      this.componentService.updateEntities(things);
    });
  }

  targetEntityClick(entity: any) {
    const target = this.target();

    const request: MultipleIdsRequest = {
      collectionId: target!.id!,
      ids: [entity.id]
    };

    let o, m;

    if (target?.selectedMode === TargetMode.TripShared) {
      o = entity.isTargeted ? this.tripSharedService.deleteFromDic(request) : this.tripSharedService.addFromDic(request);
      m = this.thingService.getAllForSharedTrip(target!.id!);

    } else {
      o = entity.isTargeted ? this.tripThingService.deleteFromDic(request) : this.tripThingService.addFromDic(request);
      m = this.thingService.getAllForTrip(target!.id!);
    }

    o.pipe(
      switchMap(() => m),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((things) => {
      this.componentService.updateEntities(things);
    });
  }
}
