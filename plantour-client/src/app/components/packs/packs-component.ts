import { Component, inject, OnInit } from '@angular/core';
import { CrudService, FromDicService, MultipleIdsRequest } from '../../services/crud-service';
import { CreatePackageRequest, UpdatePackageRequest, PackageDto, PackageService } from '../../services/package-service';
import { Router } from '@angular/router';
import { BaseListComponent } from '../base-list/base-list';
import { CreateTripPackageRequest, TripPackageDto, TripPackageService, UpdateTripPackageRequest } from '../../services/trip-package-service';
import { UpperActionType } from '../../helpers/enums';
import { PackItemComponent } from './pack-item/pack-item-component';
import { Condition } from '../../services/dynamic-query-service';
import { EntitiesService } from '../../services/entities-service';
import { filter, map, of, switchMap, tap } from 'rxjs';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeaderComponent } from '../entities/entities-header-component/entities-header-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { TripDto, TripService } from '../../services/trip-service';

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
  componentId: string = 'packs';
  packItemComponent = PackItemComponent;

  entitiesService = inject(EntitiesService);
  packageService = inject(PackageService);
  settingsPersistenceService = inject(EntitiesService).settingsPersistenceService;
  dynamicQueryService = inject(EntitiesService).dynamicQueryService;
  tripService = inject(TripService);
  tripPackageService = inject(TripPackageService);

  constructor() {
    // this.entitiesService.targetCondition$.pipe(
    //   switchMap(tripId => {
    //     if (tripId) {
    //       return this.packageService.getAllForTrip(tripId);
    //     }
    //     return this.packageService.getAll();
    //   }
    //   )
    // )
    // .subscribe(packages => {
    //   this.entitiesService.updateEntities(packages);
    // });
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

  ngOnInit(): void {

    const savedConditions = this.settingsPersistenceService.getComponentKey(this.componentId, 'conditions');
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);


    this.tripService.getAllWhereParticipant().pipe(
      tap((trips: TripDto[]) => {

        const condition: any = initialConditions.find(c => c.kind === 'filter' && c.comparisonType == 'exact' && c.property === 'target');

        if (condition && condition.filterText && !trips.find(t => t.id === condition.filterText)) {
          condition.filterText = '';
        }

        const lookup = trips.sort((a, b) => {
          const aDate = a.startDate ?? '';
          const bDate = b.startDate ?? '';
          return aDate.localeCompare(bDate);
        }).map((t: any) => ({ id: t.id, name: t.name }));

        this.entitiesService.updateComponentInit(
          {
            componentId: this.componentId,
            initialConditions: initialConditions
          }
        );

        this.entitiesService.updateTargetLookup(lookup);

      }),
      switchMap(x => {
        return this.entitiesService.targetCondition$.pipe(
          switchMap(tripId => {
            if (tripId) {
              return this.packageService.getAllForTrip(tripId);
            }
            return this.packageService.getAll();
          }
          )
        )

      })

    ).subscribe(packages =>
      this.entitiesService.updateEntities(packages)
    );


  }

  // 
  // Что нужно получить для target
  // Для Packs -> список trip packs 
  // Для Things -> список own trip things или shared trip things
  // Для Travelers -> список trip participants
  // Для упаковки trip things в trip packs -> список own trip things
  // Для assign shared trip things to trip participants -> список trip participants
  //

  deletePack(id: string): void {
    this.packageService.delete(id).pipe(
      switchMap(() => this.packageService.getAll())
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
      switchMap(() => this.packageService.getAllForTrip(tripId))
    ).subscribe((packages) => {
      this.entitiesService.updateEntities(packages);
    });
  }
}

