import { Component, inject } from '@angular/core';
import { CrudService, FromDicService, MultipleIdsRequest } from '../../services/crud-service';
import { CreateThingRequest, UpdateThingRequest, ThingDto, ThingService } from '../../services/thing-service';
import { BaseListComponent } from '../base-list/base-list';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { CreateTripThingRequest, TripThingService, TripThingDto, UpdateTripThingRequest } from '../../services/trip-thing-service';
import { UpperActionType } from '../../helpers/enums';
import { ThingItemComponent } from './things-item/thing-item-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeaderComponent } from '../entities/entities-header-component/entities-header-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { AppService } from '../../services/app-service';
import { EntitiesService } from '../../services/entities-service';
import { TripDto, TripService } from '../../services/trip-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, tap } from 'rxjs';
import { TripSharedService } from '../../services/trip-shared-service';
import { Condition } from '../../services/dynamic-query-service';
import { UsersService } from '../../services/users-service';


@Component({
  selector: 'app-things-component',
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
  entitiesService = inject(EntitiesService);
  thingService = inject(ThingService);
  settingsPersistenceService = inject(EntitiesService).settingsPersistenceService;
  dynamicQueryService = inject(EntitiesService).dynamicQueryService;
  tripService = inject(TripService);
  tripThingService = inject(TripThingService);
  tripSharedService = inject(TripSharedService);

  targetId = toSignal(this.entitiesService.targetCondition$);
  targetedIds = toSignal(this.entitiesService.targetedIds$);
  notTargetedIds = toSignal(this.entitiesService.notTargetedIds$);
  tripSelected = toSignal(this.appService.tripSelected$);

  usersService = inject(UsersService);

  thingsToSharedMode = toSignal(this.entitiesService.thingsToSharedMode$);

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

    var o = this.thingsToSharedMode() ? this.tripSharedService.addFromDic(request).pipe(
      switchMap(() => this.thingService.getAllForSharedTrip(targetId))
    )
      :
      this.tripThingService.addFromDic(request).pipe(
        switchMap(() => this.thingService.getAllForTrip(targetId))
      );

    o.subscribe((things) => {
      this.entitiesService.updateEntities(things);
    });

  }

  onDeleteTargetClick(): void {

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

    var o = this.thingsToSharedMode() ? this.tripSharedService.deleteFromDic(request).pipe(
      switchMap(() => this.thingService.getAllForSharedTrip(targetId))
    )
      :
      this.tripThingService.deleteFromDic(request).pipe(
        switchMap(() => this.thingService.getAllForTrip(targetId))
      );

    o.subscribe((things) => {
      this.entitiesService.updateEntities(things);
    });
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
        property: 'target',
        label: 'Trip',
        filterText: '',
        comparisonType: 'exact',
        icon: 'compass'
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
        property: 'name',
        label: 'Name',
        filterText: '',
        comparisonType: 'contains',
        isSelected: true,
        icon: 'box'
      }
    ];

  ngOnInit(): void {

    const savedConditions = this.settingsPersistenceService.getComponentKey(this.componentId, 'conditions');
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);

    !!!


    this.entitiesService.thingsToSharedMode$.pipe(


    ).subscribe()

    

    this.tripService.getAll().pipe(
      tap((trips: TripDto[]) => {

        const condition: any = initialConditions.find(c => c.kind === 'filter' && c.comparisonType == 'exact' && c.property === 'target');

        if (condition && condition.filterText && !trips.find(t => t.id === condition.filterText)) {
          condition.filterText = '';
        }

        if (!condition.filterText) {
          const trip = this.appService.tripSelectedValue();
          if (trip) {
            const tripId = trip.id;

            if (tripId && trips.find(t => t.id === tripId)) {

              condition.filterText = tripId;
            }
          }
        }

        const sortedTrips = trips.sort((a, b) => {
          const aDate = a.startDate ?? '';
          const bDate = b.startDate ?? '';
          return aDate.localeCompare(bDate);
        })

        let lookup;

        if (this.usersService.isParticipant) {
          lookup = sortedTrips;
        } else if (this.usersService.isAdmin) {
          if (this.thingsToSharedMode()) {
            lookup = sortedTrips.filter(x => x.currentUserIncluded)

          } else {
            lookup = sortedTrips.filter(x => !x.currentUserIncluded)

          }

        } else {
          throw new Error("Wrong user role");
        }

        lookup = lookup.map((t: any) => ({ id: t.id, name: t.name }));

        this.entitiesService.updateComponentInit(
          {
            componentId: this.componentId,
            initialConditions: initialConditions
          }
        );

        this.entitiesService.updateTargetLookup(lookup);

      }),
      switchMap(_x => {
        return this.entitiesService.targetCondition$.pipe(
          switchMap(tripId => {
            if (!tripId) {
              return this.thingService.getAll();
            }
            return this.entitiesService.thingsToSharedMode$.pipe(






              switchMap(toShared => {
                if (toShared) {
                  return this.thingService.getAllForSharedTrip(tripId);
                }
                return this.thingService.getAllForTrip(tripId);
              })
            )
          }
          )
        )

      })

    ).subscribe(things =>
      this.entitiesService.updateEntities(things)
    );
  }

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
      })
    ).subscribe((packages) => {
      this.entitiesService.updateEntities(packages);
    });
  }

  targetEntityClick(tripId: string, entity: any) {
    const request: MultipleIdsRequest = {
      collectionId: tripId,
      ids: [entity.id]
    };

    const o = entity.isTargeted ? this.tripThingService.deleteFromDic(request) : this.tripThingService.addFromDic(request);

    o.pipe(
      switchMap(() => this.thingService.getAllForTrip(tripId))
    ).subscribe((packages) => {
      this.entitiesService.updateEntities(packages);
    });
  }

}
