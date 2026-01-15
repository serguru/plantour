import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CrudService, FromDicService } from '../../services/crud-service';
import { TripUserDto, CreateTripUserRequest, UpdateTripUserRequest, TripUserService } from '../../services/trip-user-service';
import { ActivatedRoute, Router } from '@angular/router';
import { TripUserItemComponent } from './trip-user-item/trip-user-item-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { Condition, DynamicQueryService } from '../../services/dynamic-query-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CurrentTripService } from '../../services/current-trip-service';
import { switchMap, tap } from 'rxjs';


// TODO: make read only for participants
@Component({
  selector: 'app-trip-participants',
  standalone: true,
  imports: [
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent
  ],
  templateUrl: './trip-users-component.html',
  styleUrl: './trip-users-component.scss',
})
export class TripUsersComponent implements OnInit {
  tripUserItemComponent = TripUserItemComponent;
  componentId: string = 'trip-users';

  componentService = inject(ComponentService);
  tripUsersService = inject(TripUserService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(DynamicQueryService);
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
        property: 'fullName',
        sortType: 'text',
        direction: 'none'
      },
      {
        kind: 'filter',
        property: 'fullName',
        label: 'Filter by Name',
        filterText: '',
        comparisonType: 'contains',
        icon: 'filter'
      }
    ];

  ngOnInit(): void {

    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');

    // The checkTripIdGuard should ensure this never happens
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }


    this.initConditions(this.componentId);

    this.initSavedFeatures();

    this.tripUsersService.getAll(this.tripId!).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(tripUsers =>
      this.componentService.updateEntities(tripUsers || [])
    );
  }

  initSavedFeatures() {
    const v = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    const id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    this.componentService.updateSelectedId(id);
  }


  initConditions(componentId: string | null, packs: TripUserDto[] | null = null): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }
    const savedConditions = this.localStorageService.getComponentKeyObject(componentId, 'conditions') || [];
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);
    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }

  deleteTripUser(id: string): void {
    this.tripUsersService.delete(id).pipe(
      switchMap(_ =>
        this.tripUsersService.getAll(this.tripId!)
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripUsers) => {
      this.componentService.updateEntities(tripUsers);
    });
  }

}