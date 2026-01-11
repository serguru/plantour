import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { CrudService, FromDicService, MultipleIdsRequest } from '../../services/crud-service';
import { CreatePackageRequest, UpdatePackageRequest, PackageDto, PackageService } from '../../services/package-service';
import { Router } from '@angular/router';
import { BaseListComponent } from '../base-list/base-list';
import { CreateTripPackageRequest, TripPackageDto, TripPackageService, UpdateTripPackageRequest } from '../../services/trip-package-service';
import { UpperActionType } from '../../helpers/enums';
import { PackItemComponent } from './pack-item/pack-item-component';
import { Condition, Target, TargetCondition, TargetMode, TargetOption } from '../../services/dynamic-query-service';
import { ComponentService } from '../../services/component-service';
import { EMPTY, filter, map, mergeMap, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
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

  componentService = inject(ComponentService);
  packageService = inject(PackageService);
  settingsPersistenceService = inject(ComponentService).settingsPersistenceService;
  dynamicQueryService = inject(ComponentService).dynamicQueryService;
  tripPackageService = inject(TripPackageService);

  targetCondition = toSignal(this.componentService.targetCondition$);
  target = toSignal(this.componentService.target$);


  targetedIds = toSignal(this.componentService.targetedIds$);
  notTargetedIds = toSignal(this.componentService.notTargetedIds$);
  tripSelected = toSignal(this.appService.tripSelected$);
  private destroyRef = inject(DestroyRef);

  conditions: Condition[] =
    [
      {
        kind: 'sort',
        label: 'Sort by Name',
        icon: 'sort-alpha-down',
        property: 'name',
        sortType: 'text',
        direction: 'none'
      },
      {
        kind: 'target',
        label: 'Trip',
        icon: 'compass',
        target: null
      },
      {
        kind: 'filter',
        property: 'name',
        label: 'Lookup by Name',
        filterText: '',
        comparisonType: 'exact',
        icon: 'box'
      },
      {
        kind: 'filter',
        property: 'name',
        label: 'Filter by Name',
        filterText: '',
        comparisonType: 'contains',
        icon: 'box'
      }
    ];

  ngOnInit(): void {

    this.componentService.updateComponentId(this.componentId);

    this.tripService.getAllWhereParticipant().pipe(
      tap((trips: TripDto[]) => {
        this.initConditions(this.componentId, trips);
        this.initTargetLookup(trips);
        this.initSavedFeatures();
      }),
      switchMap(_ =>
        this.componentService.target$.pipe(
          switchMap((target: Target | null) => {
            if (target && target.id) {
              return this.packageService.getAllForTrip(target.id);
            }
            return this.packageService.getAll();
          }),
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(packages =>
      this.componentService.updateEntities(packages || [])
    );
  }

  initSavedFeatures() {
    const v = !!this.settingsPersistenceService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    const id = this.settingsPersistenceService.getComponentKey(this.componentId, 'selectedId');
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
    }).map((t: any) => ({
      id: t.id,
      name: t.name
    }));

    this.componentService.updateTargetLookup(lookup);
  }

  initConditions(componentId: string | null, trips: TripDto[] | null = null): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }
    const savedConditions = this.settingsPersistenceService.getComponentKey(componentId, 'conditions') || [];
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);
    const targetCondition: TargetCondition | undefined = initialConditions.find(c => c.kind === 'target');

    if (targetCondition) {
      const trip = trips?.find(t => t.id === targetCondition.target?.id);
      if (!trip) {
        const trip = this.appService.tripSelectedValue();
        if (trip && trips?.find(t => t.id === trip.id)) {
          targetCondition.target = {
            id: trip.id, name: trip.name, selectedMode: TargetMode.TripThings, options: [{
              label: 'Trip Things',
              mode: TargetMode.TripThings
            }]
          };
        }
      }
    }

    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }

  onAddTargetClick(): void {
    const targetId = this.target()?.id;

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
      this.componentService.updateEntities(packages);
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
      collectionId: targetId,
      ids: ids
    };
    this.tripPackageService.deleteFromDic(request).pipe(
      switchMap(() => this.packageService.getAllForTrip(targetId)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((packages) => {
      this.componentService.updateEntities(packages);
    });
  }

  deletePack(id: string): void {
    this.packageService.delete(id).pipe(

      switchMap(x => {
        return this.componentService.target$.pipe(
          switchMap(target => {
            const tripId = target?.id;
            if (tripId) {
              return this.packageService.getAllForTrip(tripId);
            }
            return this.packageService.getAll();
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((packages) => {
      this.componentService.updateEntities(packages);
    });
  }

  targetEntityButtonClick(entity: any) {
    const target = this.target();

    const request: MultipleIdsRequest = {
      collectionId: target!.id!,
      ids: [entity.id]
    };

    const o = entity.isTargeted ? this.tripPackageService.deleteFromDic(request) : this.tripPackageService.addFromDic(request);

    o.pipe(
      switchMap(() => this.packageService.getAllForTrip(target!.id!)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((packages) => {
      this.componentService.updateEntities(packages);
    });



  }

  
  
  // targetEntityButtonClick(targetCondition: TargetCondition, entity: any) {

  //   const request: MultipleIdsRequest = {
  //     collectionId: targetCondition.target!.id!,
  //     ids: [entity.id]
  //   };

  //   const o = entity.isTargeted ? this.tripPackageService.deleteFromDic(request) : this.tripPackageService.addFromDic(request);

  //   o.pipe(
  //     switchMap(() => this.packageService.getAllForTrip(targetCondition.target!.id!)),
  //     takeUntilDestroyed(this.destroyRef)
  //   ).subscribe((packages) => {
  //     this.componentService.updateEntities(packages);
  //   });
  // }
}