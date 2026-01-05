import { Component, inject, OnInit } from '@angular/core';
import { CrudService, FromDicService } from '../../services/crud-service';
import { CreatePackageRequest, UpdatePackageRequest, PackageDto, UserPackageService } from '../../services/package-service';
import { Router } from '@angular/router';
import { BaseListComponent } from '../base-list/base-list';
import { CreateTripPackageRequest, TripPackageDto, TripPackageService, UpdateTripPackageRequest } from '../../services/trip-package-service';
import { UpperActionType } from '../../helpers/enums';
import { PackItemComponent } from './pack-item/pack-item-component';
import { Condition } from '../../services/dynamic-query-service';
import { EntitiesService } from '../../services/entities-service';
import { switchMap } from 'rxjs';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeaderComponent } from '../entities/entities-header-component/entities-header-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';

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
  packageService = inject(UserPackageService);

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
        property: 'name',
        label: 'Name',
        filterText: '',
        comparisonType: 'contains',
        isSelected: true,
        icon: 'box'
      }
    ];

  ngOnInit(): void {
    this.packageService.getAll().subscribe(
      (packages) => {
        this.entitiesService.updateComponentInit(
          {
            componentId: this.componentId,
            initialConditions: this.conditions
          }
        );
        this.entitiesService.updateEntities(packages);
      }
    );
  }

  deletePack(id: string): void {
    this.packageService.delete(id).pipe(
      switchMap(() => this.packageService.getAll())
    ).subscribe((packages) => {
      this.entitiesService.updateEntities(packages);
    });
  }
}
