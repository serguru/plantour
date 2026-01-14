import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CrudService, FromDicService, MultipleIdsRequest } from '../../services/crud-service';
import { TripPackageDto, CreateTripPackageRequest, UpdateTripPackageRequest, TripPackageService } from '../../services/trip-package-service';
import { ActivatedRoute, Router } from '@angular/router';
import { TripPackItemComponent } from './trip-pack-item/trip-pack-item-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeaderComponent } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { Condition, DynamicQueryService } from '../../services/dynamic-query-service';
import { CurrentTripService } from '../../services/current-trip-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';


@Component({
  selector: 'app-trip-packs',
  standalone: true,
  imports: [
    EntitiesComponent,
    EntitiesHeaderComponent,
    EntitiesActionsComponent
  ],
  templateUrl: './trip-packs-component.html',
  styleUrl: './trip-packs-component.scss',
})
export class TripPacksComponent implements OnInit {
  tripPackItemComponent = TripPackItemComponent;
  componentId: string = 'trip-packs';

  componentService = inject(ComponentService);

  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(DynamicQueryService);

  tripPackageService = inject(TripPackageService);


  currentTripService = inject(CurrentTripService);

  private route = inject(ActivatedRoute);

  private destroyRef = inject(DestroyRef);

  private tripId: string | null = null;

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
        kind: 'filter',
        property: 'name',
        label: 'Filter by Name',
        filterText: '',
        comparisonType: 'contains',
        icon: 'filter'
      }
    ];

  initConditions(componentId: string | null): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }
    const savedConditions = this.localStorageService.getComponentKeyObject(componentId, 'conditions') || [];
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);
    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }


  ngOnInit(): void {

    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');

    // The checkTripIdGuard should ensure this never happens
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.initConditions(this.componentId);

    this.initSavedFeatures();

    this.tripPackageService.getAll(this.tripId!).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(tripPacks =>
      this.componentService.updateEntities(tripPacks || [])
    );
  }

  initSavedFeatures() {
    const v = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    const id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    this.componentService.updateSelectedId(id);
  }


  deleteTripPack(id: string): void {
    this.tripPackageService.delete(id, this.tripId!).pipe(
      switchMap(_ => 
        this.tripPackageService.getAll(this.tripId!)
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripPacks) => {
      this.componentService.updateEntities(tripPacks);
    });
  }
}