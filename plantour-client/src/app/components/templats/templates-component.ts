import { Component, DestroyRef, inject } from '@angular/core';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesHeaderComponent } from '../entities/entities-header-component/entities-header-component';
import { EntitiesComponent } from '../entities/entities-component';
import { TemplateItemComponent } from './template-item/template-item-component';
import { TripService } from '../../services/trip-service';
import { AppService } from '../../services/app-service';
import { ThingService } from '../../services/thing-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ComponentService } from '../../services/component-service';
import { TripSharedService } from '../../services/trip-shared-service';
import { TripThingService } from '../../services/trip-thing-service';
import { combineLatest, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-template-things-component',
  imports: [
    // EntitiesComponent,
    // EntitiesHeaderComponent,
    // EntitiesActionsComponent
  ],
  templateUrl: './templates-component.html',
  styleUrl: './templates-component.scss',
})
export class TemplatesComponent {
  templateItemComponent = TemplateItemComponent;
  componentId: string = 'templates';
  appService = inject(AppService);
  tripService = inject(TripService);
  thingService = inject(ThingService);

  componentService = inject(ComponentService);
  settingsPersistenceService = inject(ComponentService).settingsPersistenceService;
  dynamicQueryService = inject(ComponentService).dynamicQueryService;
  tripThingService = inject(TripThingService);
  tripSharedService = inject(TripSharedService);

  targetId = toSignal(this.componentService.targetCondition$);
  targetedIds = toSignal(this.componentService.targetedIds$);
  notTargetedIds = toSignal(this.componentService.notTargetedIds$);
  tripSelected = toSignal(this.appService.tripSelected$);

  private destroyRef = inject(DestroyRef);

  constructor() {
  }

  // ngOnInit(): void {

  //   const savedSharedMode = this.settingsPersistenceService.getComponentKey(this.componentId, 'thingsToSharedMode');
  //   this.componentService.updateThingsToSharedMode(!!savedSharedMode);

  //   combineLatest([
  //     this.componentService.thingsToSharedMode$,
  //     this.componentService.targetCondition$
  //   ]).pipe(
  //     switchMap(([isSharedMode, tripId]) => {
  //       if (!tripId) {
  //         return this.thingService.getAll();
  //       }
  //       if (isSharedMode) {
  //         return this.thingService.getAllForSharedTrip(tripId!);
  //       }
  //       return this.thingService.getAllForTrip(tripId);
  //     }),
  //     takeUntilDestroyed(this.destroyRef)
  //   ).subscribe(things =>
  //     this.componentService.updateEntities(things || [])
  //   );

  //   this.componentService.thingsToSharedMode$
  //     .pipe(
  //       switchMap(isSharedMode => {
  //         if (isSharedMode) {
  //           return this.tripService.getAllWhereParticipant();
  //         }
  //         return this.tripService.getAll();
  //       }),
  //       take(1),
  //       tap((trips: TripDto[]) => {
  //         this.initState(this.componentId, trips);
  //       }),
  //       takeUntilDestroyed(this.destroyRef)
  //     ).subscribe();


  //   this.componentService.thingsToSharedMode$
  //     .pipe(
  //       switchMap(isSharedMode => {
  //         if (isSharedMode) {
  //           return this.tripService.getAllWhereParticipant();
  //         }
  //         return this.tripService.getAll();
  //       }),
  //       tap((trips: TripDto[]) => {
  //         this.initTargetLookup(trips);
  //       }),
  //       takeUntilDestroyed(this.destroyRef)
  //     ).subscribe();


  // }

  // initTargetLookup(trips: TripDto[] | null) {

  //   if (!trips) {
  //     this.componentService.updateTargetLookup([]);
  //     return;
  //   }

  //   const lookup = (trips).sort((a, b) => {
  //     const aDate = a.startDate ?? '';
  //     const bDate = b.startDate ?? '';
  //     return aDate.localeCompare(bDate);
  //   }).map((t: any) => ({ id: t.id, name: t.name }));

  //   this.componentService.updateTargetLookup(lookup);
  // }

  // initState(componentId: string | null, trips: TripDto[] | null = null): void {
  //   if (!componentId) {
  //     return;
  //   }
  //   const savedConditions = this.settingsPersistenceService.getComponentKey(componentId, 'conditions');
  //   const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);

  //   const targetCondition: any = initialConditions.find(c => c.kind === 'filter' && c.comparisonType == 'exact' && c.property === 'target');

  //   if (targetCondition && targetCondition.filterText) {
  //     const trip = trips?.find(t => t.id === targetCondition.filterText);
  //     if (!trip) {
  //       targetCondition.filterText = '';
  //     }
  //   }

  //   if (!targetCondition.filterText) {
  //     const tripId = this.appService.tripSelectedValue()?.id;
  //     if (tripId && trips?.find(t => t.id === tripId)) {
  //       targetCondition.filterText = tripId;
  //     }
  //   }

  //   this.componentService.updateComponentInit(
  //     {
  //       componentId: componentId,
  //       initialConditions: initialConditions
  //     }
  //   );

  // }

  // onAddTargetClick(): void {
  //   const targetId = this.targetId();
  //   if (!targetId) {
  //     throw new Error('Target Trip Id is not set');
  //   }
  //   const ids = this.notTargetedIds();
  //   if (!ids || ids.length === 0) {
  //     throw new Error('No not targeted ids available');
  //   }
  //   const request: MultipleIdsRequest = {
  //     collectionId: targetId,
  //     ids: ids
  //   };

  //   this.addTripIds(targetId, request);
  // }

  // private addTripIds(tripId: string, request: MultipleIdsRequest): void {
  //   this.componentService.thingsToSharedMode$
  //     .pipe(
  //       switchMap(isSharedMode => {
  //         if (isSharedMode) {
  //           return this.tripSharedService.addFromDic(request).pipe(
  //             switchMap(() => this.thingService.getAllForSharedTrip(tripId))
  //           )
  //         }
  //         return this.tripThingService.addFromDic(request).pipe(
  //           switchMap(() => this.thingService.getAllForTrip(tripId))
  //         )
  //       }),
  //       takeUntilDestroyed(this.destroyRef)
  //     ).subscribe(things =>
  //       this.componentService.updateEntities(things)
  //     );
  // }

  // onDeleteTargetClick(): void {
  //   const targetId = this.targetId();
  //   if (!targetId) {
  //     throw new Error('Target Id is not set');
  //   }
  //   const ids = this.targetedIds();
  //   if (!ids || ids.length === 0) {
  //     throw new Error('No targeted ids available');
  //   }
  //   const request: MultipleIdsRequest = {
  //     collectionId: targetId,
  //     ids: ids
  //   };
  //   this.deleteTripIds(targetId, request);
  // }

  // private deleteTripIds(tripId: string, request: MultipleIdsRequest): void {
  //   this.componentService.thingsToSharedMode$
  //     .pipe(
  //       switchMap(isSharedMode => {
  //         if (isSharedMode) {
  //           return this.tripSharedService.deleteFromDic(request).pipe(
  //             switchMap(() => this.thingService.getAllForSharedTrip(tripId))
  //           )
  //         }
  //         return this.tripThingService.deleteFromDic(request).pipe(
  //           switchMap(() => this.thingService.getAllForTrip(tripId))
  //         )
  //       }),
  //       takeUntilDestroyed(this.destroyRef)
  //     ).subscribe(things =>
  //       this.componentService.updateEntities(things)
  //     );
  // }

  // conditions: Condition[] =
  //   [
  //     {
  //       kind: 'sort',
  //       property: 'name',
  //       sortType: 'text',
  //       direction: 'none'
  //     },
  //     {
  //       kind: 'filter',
  //       property: 'category',
  //       label: 'Category',
  //       filterText: '',
  //       comparisonType: 'exact',
  //       icon: 'folder-open'
  //     },
  //     {
  //       kind: 'filter',
  //       property: 'target',
  //       label: 'Trip',
  //       filterText: '',
  //       comparisonType: 'exact',
  //       icon: 'compass'
  //     },
  //     {
  //       kind: 'filter',
  //       property: 'name',
  //       label: 'Name',
  //       filterText: '',
  //       comparisonType: 'contains',
  //       isSelected: true,
  //       icon: 'box'
  //     }
  //   ];

  // deleteThing(id: string): void {
  //   this.thingService.delete(id).pipe(

  //     switchMap(x => {
  //       return this.componentService.targetCondition$.pipe(
  //         switchMap(tripId => {
  //           if (tripId) {
  //             return this.thingService.getAllForTrip(tripId);
  //           }
  //           return this.thingService.getAll();
  //         })
  //       );
  //     }),
  //     takeUntilDestroyed(this.destroyRef)
  //   ).subscribe((things) => {
  //     this.componentService.updateEntities(things);
  //   });
  // }

  // targetEntityClick(tripId: string, entity: any) {
  //   const request: MultipleIdsRequest = {
  //     collectionId: tripId,
  //     ids: [entity.id]
  //   };

  //   if (entity.isTargeted) {
  //     this.deleteTripIds(tripId, request);
  //     return;
  //   }

  //   this.addTripIds(tripId, request);
  // }
}
