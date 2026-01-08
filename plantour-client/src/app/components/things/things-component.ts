import { Component, DestroyRef, inject } from '@angular/core';
import { CrudService, FromDicService, MultipleIdsRequest } from '../../services/crud-service';
import { CreateThingRequest, UpdateThingRequest, ThingDto, ThingService } from '../../services/thing-service';
import { CreateTripThingRequest, TripThingService, TripThingDto, UpdateTripThingRequest } from '../../services/trip-thing-service';
import { UpperActionType } from '../../helpers/enums';
import { ThingItemComponent } from './things-item/thing-item-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeaderComponent } from '../entities/entities-header-component/entities-header-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { AppService } from '../../services/app-service';
import { EntitiesService } from '../../services/entities-service';
import { TripDto, TripService } from '../../services/trip-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, switchMap, take, tap } from 'rxjs';
import { TripSharedService } from '../../services/trip-shared-service';
import { Condition } from '../../services/dynamic-query-service';

@Component({
  selector: 'app-things',
  imports: [
    EntitiesComponent,
    EntitiesHeaderComponent,
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

  // This does not work syncronously
  trips = toSignal(this.tripService.getAllWhereParticipant(), { initialValue: null });

  entitiesService = inject(EntitiesService);
  thingService = inject(ThingService);
  settingsPersistenceService = inject(EntitiesService).settingsPersistenceService;
  dynamicQueryService = inject(EntitiesService).dynamicQueryService;
  tripThingService = inject(TripThingService);
  tripSharedService = inject(TripSharedService);

  targetId = toSignal(this.entitiesService.targetCondition$);
  targetedIds = toSignal(this.entitiesService.targetedIds$);
  notTargetedIds = toSignal(this.entitiesService.notTargetedIds$);
  tripSelected = toSignal(this.appService.tripSelected$);

  private destroyRef = inject(DestroyRef);

  constructor() {

  }

  ngOnInit(): void {

    const savedSharedMode = this.settingsPersistenceService.getComponentKey(this.componentId, 'thingsToSharedMode');
    this.entitiesService.updateThingsToSharedMode(!!savedSharedMode);

    combineLatest([
      this.entitiesService.thingsToSharedMode$,
      this.entitiesService.targetCondition$
    ]).pipe(
      switchMap(([isSharedMode, tripId]) => {
        if (!tripId) {
          return this.thingService.getAll();
        }
        if (isSharedMode) {
          return this.thingService.getAllForSharedTrip(tripId!);
        }
        return this.thingService.getAllForTrip(tripId);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(things =>
      this.entitiesService.updateEntities(things || [])
    );

    this.entitiesService.thingsToSharedMode$
      .pipe(
        switchMap(isSharedMode => {
          if (isSharedMode) {
            return this.tripService.getAllWhereParticipant();
          }
          return this.tripService.getAll();
        }),
        take(1),
        tap((trips: TripDto[]) => {
          this.initState(this.componentId, trips);
        }),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();


    this.entitiesService.thingsToSharedMode$
      .pipe(
        switchMap(isSharedMode => {
          if (isSharedMode) {
            return this.tripService.getAllWhereParticipant();
          }
          return this.tripService.getAll();
        }),
        tap((trips: TripDto[]) => {
          this.initTargetLookup(trips);
        }),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();


  }

  initTargetLookup(trips: TripDto[] | null) {

    if (!trips) {
      this.entitiesService.updateTargetLookup([]);
      return;
    }

    const lookup = (trips).sort((a, b) => {
      const aDate = a.startDate ?? '';
      const bDate = b.startDate ?? '';
      return aDate.localeCompare(bDate);
    }).map((t: any) => ({ id: t.id, name: t.name }));

    this.entitiesService.updateTargetLookup(lookup);
  }

  initState(componentId: string | null, trips: TripDto[] | null = null): void {
    if (!componentId) {
      return;
    }
    const savedConditions = this.settingsPersistenceService.getComponentKey(componentId, 'conditions');
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);

    const targetCondition: any = initialConditions.find(c => c.kind === 'filter' && c.comparisonType == 'exact' && c.property === 'target');

    if (targetCondition && targetCondition.filterText) {
      const trip = trips?.find(t => t.id === targetCondition.filterText);
      if (!trip) {
        targetCondition.filterText = '';
      }
    }

    if (!targetCondition.filterText) {
      const tripId = this.appService.tripSelectedValue()?.id;
      if (tripId && trips?.find(t => t.id === tripId)) {
        targetCondition.filterText = tripId;
      }
    }

    this.entitiesService.updateComponentInit(
      {
        componentId: componentId,
        initialConditions: initialConditions
      }
    );

  }

  onAddTargetClick(): void {
    const targetId = this.targetId();
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

    this.addTripIds(targetId, request);
  }

  private addTripIds(tripId: string, request: MultipleIdsRequest): void {
    this.entitiesService.thingsToSharedMode$
      .pipe(
        switchMap(isSharedMode => {
          if (isSharedMode) {
            return this.tripSharedService.addFromDic(request).pipe(
              switchMap(() => this.thingService.getAllForSharedTrip(tripId))
            )
          }
          return this.tripThingService.addFromDic(request).pipe(
            switchMap(() => this.thingService.getAllForTrip(tripId))
          )
        }),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(things =>
        this.entitiesService.updateEntities(things)
      );
  }

  onDeleteTargetClick(): void {
    const targetId = this.targetId();
    if (!targetId) {
      throw new Error('Target Id is not set');
    }
    const ids = this.targetedIds();
    if (!ids || ids.length === 0) {
      throw new Error('No targeted ids available');
    }
    const request: MultipleIdsRequest = {
      collectionId: targetId,
      ids: ids
    };
    this.deleteTripIds(targetId, request);
  }

  private deleteTripIds(tripId: string, request: MultipleIdsRequest): void {
    this.entitiesService.thingsToSharedMode$
      .pipe(
        switchMap(isSharedMode => {
          if (isSharedMode) {
            return this.tripSharedService.deleteFromDic(request).pipe(
              switchMap(() => this.thingService.getAllForSharedTrip(tripId))
            )
          }
          return this.tripThingService.deleteFromDic(request).pipe(
            switchMap(() => this.thingService.getAllForTrip(tripId))
          )
        }),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(things =>
        this.entitiesService.updateEntities(things)
      );
  }

  conditions: Condition[] =
    [
      {
        kind: 'sort',
        property: 'name',
        sortType: 'text',
        direction: 'none'
      },
      {
        kind: 'filter',
        property: 'category',
        label: 'Category',
        filterText: '',
        comparisonType: 'exact',
        icon: 'folder-open'
      },
      {
        kind: 'filter',
        property: 'target',
        label: 'Trip',
        filterText: '',
        comparisonType: 'exact',
        icon: 'compass'
      },
      {
        kind: 'filter',
        property: 'name',
        label: 'Name',
        filterText: '',
        comparisonType: 'contains',
        isSelected: true,
        icon: 'box'
      }
    ];

  deleteThing(id: string): void {
    this.thingService.delete(id).pipe(

      switchMap(x => {
        return this.entitiesService.targetCondition$.pipe(
          switchMap(tripId => {
            if (tripId) {
              return this.thingService.getAllForTrip(tripId);
            }
            return this.thingService.getAll();
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((things) => {
      this.entitiesService.updateEntities(things);
    });
  }

  targetEntityClick(tripId: string, entity: any) {
    const request: MultipleIdsRequest = {
      collectionId: tripId,
      ids: [entity.id]
    };

    if (entity.isTargeted) {
      this.deleteTripIds(tripId, request);
      return;
    }

    this.addTripIds(tripId, request);
  }
}
