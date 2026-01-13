import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CrudService } from '../../services/crud-service';
import { TripDto, TripService } from '../../services/trip-service';
import { BaseListComponent } from '../base-list/base-list';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { AppService } from '../../services/app-service';
import { TripItemComponent } from './trip-item/trip-item-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeaderComponent } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { TripThingService } from '../../services/trip-thing-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Condition, TargetCondition } from '../../services/dynamic-query-service';
import { UsersService } from '../../services/users-service';
import { concatMap, distinctUntilChanged, filter, switchMap, tap, withLatestFrom } from 'rxjs';
import { CurrentTripService } from '../../services/current-trip-service';
import { LocalStorageService } from '../../services/local-storage-service';


// TODO: Add a method to create a new trip from the existing one 
// TODO: Find out why it sends two request per a list trip click
@Component({
  selector: 'app-trips-component',
  imports: [
    EntitiesComponent,
    EntitiesHeaderComponent,
    EntitiesActionsComponent
  ],
  standalone: true,
  templateUrl: './trips-component.html',
  styleUrl: './trips-component.scss',
})
export class TripsComponent implements OnInit {
  tripItemComponent = TripItemComponent;
  componentId: string = 'trips';

 // appService = inject(AppService);
  tripService = inject(TripService);

  componentService = inject(ComponentService);

  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(ComponentService).dynamicQueryService;

  currentTripService = inject(CurrentTripService);
  tripSelected = toSignal(this.currentTripService.currentTripDto$);
  
  usersService = inject(UsersService);


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



    var o = this.usersService.isAdminSignal() ? this.tripService.getAll() : this.tripService.getAllWhereParticipant();

    o.pipe(
      tap((trips: TripDto[]) => {
        this.initConditions(this.componentId, trips);
        this.initSavedFeatures();
        this.componentService.updateEntities(trips || [])
      }),
      concatMap(trips =>
        this.componentService.selectedId$.pipe(
          withLatestFrom(
            this.componentService.componentId$,
          ),
          filter(([id, componentId]) => componentId === this.componentId),
          distinctUntilChanged(),
          tap(([id, componentId]) => {
            if (!id || !trips || trips.length === 0) {
              this.currentTripService.updateCurrentTripId(null);
              return;
            }
            const selected = trips.find(e => e.id === id) || null;
            this.currentTripService.updateCurrentTripId(selected ? selected.id : null);
          }),
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  initSavedFeatures() {
    const v = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    const id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    this.componentService.updateSelectedId(id);
  }


  initConditions(componentId: string | null, trips: TripDto[] | null = null): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }
    const savedConditions = this.localStorageService.getComponentKeyObject(componentId, 'conditions') || [];
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);
    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }

  deleteTrip(id: string): void {
    this.tripService.delete(id).pipe(
      switchMap(x => {
        return this.usersService.isAdminSignal() ? this.tripService.getAll() : this.tripService.getAllWhereParticipant();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(trips => {
      this.componentService.updateEntities(trips);
    });
  }
}