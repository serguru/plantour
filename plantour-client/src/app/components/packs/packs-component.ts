import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { CrudService, FromDicService, MultipleIdsRequest } from '../../services/crud-service';
import { CreatePackageRequest, UpdatePackageRequest, PackageDto, PackageService } from '../../services/package-service';
import { Router } from '@angular/router';
import { BaseListComponent } from '../base-list/base-list';
import { CreateTripPackageRequest, TripPackageDto, TripPackageService, UpdateTripPackageRequest } from '../../services/trip-package-service';
import { UpperActionType } from '../../helpers/enums';
import { PackItemComponent } from './pack-item/pack-item-component';
import { Condition } from '../../services/dynamic-query-service';
import { EntitiesCounts, EntitiesService } from '../../services/entities-service';
import { filter, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeaderComponent } from '../entities/entities-header-component/entities-header-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { TripDto, TripService } from '../../services/trip-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AppService } from '../../services/app-service';

@Component({
  selector: 'app-packs',
  imports: [
    EntitiesComponent,
    EntitiesHeaderComponent,
    EntitiesActionsComponent
  ],
  templateUrl: './packs-component.html',
  styleUrl: './packs-component.scss',
})
export class PacksComponent implements OnInit {

  packItemComponent = PackItemComponent;
  componentId = 'packs';

  appService = inject(AppService);
  tripService = inject(TripService);

  // This does not work
  trips = toSignal(this.tripService.getAllWhereParticipant(), { initialValue: null });

  entitiesService = inject(EntitiesService);
  packageService = inject(PackageService);
  settingsPersistenceService = inject(EntitiesService).settingsPersistenceService;
  dynamicQueryService = inject(EntitiesService).dynamicQueryService;
  tripPackageService = inject(TripPackageService);

  targetId = toSignal(this.entitiesService.targetCondition$);
  targetedIds = toSignal(this.entitiesService.targetedIds$);
  notTargetedIds = toSignal(this.entitiesService.notTargetedIds$);
  tripSelected = toSignal(this.appService.tripSelected$);
  private destroyRef = inject(DestroyRef);

  constructor() {
  }

  ngOnInit(): void {
    this.entitiesService.targetCondition$.pipe(
      switchMap(tripId => {
        if (tripId) {
          return this.packageService.getAllForTrip(tripId);
        }
        return this.packageService.getAll();
      }
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(packages =>
      this.entitiesService.updateEntities(packages || [])
    );

    this.tripService.getAllWhereParticipant().pipe(
      tap((trips: TripDto[]) => {
        this.initState(this.componentId, trips);
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
    this.tripPackageService.addFromDic(request).pipe(
      switchMap(() => this.packageService.getAllForTrip(targetId)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((packages) => {
      this.entitiesService.updateEntities(packages);
    });
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
    this.tripPackageService.deleteFromDic(request).pipe(
      switchMap(() => this.packageService.getAllForTrip(targetId)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((packages) => {
      this.entitiesService.updateEntities(packages);
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
        property: 'name',
        label: 'Name',
        filterText: '',
        comparisonType: 'contains',
        isSelected: true,
        icon: 'box'
      }
    ];



  deletePack(id: string): void {
    this.packageService.delete(id).pipe(

      switchMap(x => {
        return this.entitiesService.targetCondition$.pipe(
          switchMap(tripId => {
            if (tripId) {
              return this.packageService.getAllForTrip(tripId);
            }
            return this.packageService.getAll();
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((packages) => {
      this.entitiesService.updateEntities(packages);
    });
  }

  targetEntityClick(tripId: string, entity: any) {
    const request: MultipleIdsRequest = {
      collectionId: tripId,
      ids: [entity.id]
    };

    const o = entity.isTargeted ? this.tripPackageService.deleteFromDic(request) : this.tripPackageService.addFromDic(request);

    o.pipe(
      switchMap(() => this.packageService.getAllForTrip(tripId)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((packages) => {
      this.entitiesService.updateEntities(packages);
    });
  }
}