import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { TripUserDto, TripUserService } from '../../services/trip-user-service';
import { ActivatedRoute, Router } from '@angular/router';
import { TripUserItemComponent } from './trip-user-item/trip-user-item-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { Condition, DynamicQueryService } from '../../services/dynamic-query-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CurrentTripService } from '../../services/current-trip-service';
import { switchMap, tap } from 'rxjs';
import { UsersService } from '../../services/users-service';

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
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private tripId: string | null = null;

  usersService = inject(UsersService);
  isReadOnly = this.usersService.isParticipantSignal;

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

  lowerTextVisible = signal<boolean>(true);

  menuItems = computed<MenuConfig[]>(() => {
    return [
      {
        label: (this.lowerTextVisible() ? 'Hide' : 'Show') + ' Lower Text',
        icon: 'check',
        action: () => {
          this.lowerTextVisible.set(!this.lowerTextVisible());
          this.localStorageService.setComponentKey(this.componentId, 'lowerTextVisible', this.lowerTextVisible());
        }
      }
    ];
  }
  );

  itemMetaData: any = {
    lowerTextVisible: this.lowerTextVisible,
  }

  ngOnInit(): void {

    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');

    // The checkTripIdGuard should ensure this never happens
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.initConditions(this.componentId);


    this.tripUsersService.getAll(this.tripId!).pipe(
      tap((p: TripUserDto[]) => {
        this.initSavedFeatures(p);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(tripUsers =>
      this.componentService.updateEntities(tripUsers || [])
    );
  }

  initSavedFeatures(items: TripUserDto[]) {
    const v = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    let id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    if(!items || !items.find(x => x.id === id)) {
      id = null;
    }
    this.componentService.updateSelectedId(id);

    const lowerTextVisible: boolean = this.localStorageService.getComponentKey(this.componentId, 'lowerTextVisible');
    this.lowerTextVisible.set(lowerTextVisible);

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
    this.tripUsersService.delete(this.tripId!, id).pipe(
      switchMap(_ =>
        this.tripUsersService.getAll(this.tripId!)
      ),
      tap(_ => {
        this.currentTripService.refreshCurrentTrip();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripUsers) => {
      this.componentService.updateEntities(tripUsers);
    });
  }

}