import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, switchMap, tap } from 'rxjs';
import { EntitiesActionsComponent } from '../../entities/entities-actions-component/entities-actions-component';
import { EntitiesComponent } from '../../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../../services/component-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { Condition, DynamicQueryService } from '../../../services/dynamic-query-service';
import { ItineraryPartDto, ItineraryService } from '../../../services/itinerary-service';
import { TripActivityDto, TripActivityService, UpdateTripActivityRequest } from '../../../services/trip-activity-service';
import { TripActivityPersonalItemComponent } from './trip-activity-item/trip-activity-personal-item-component';
import { enrichTripActivities, sortTripActivityItineraryParts } from '../trip-activity-utils';

@Component({
  selector: 'app-trip-activity-personal',
  standalone: true,
  imports: [
    EntitiesActionsComponent,
    EntitiesComponent,
    EntitiesHeader,
  ],
  templateUrl: './trip-activity-personal-component.html',
  styleUrl: './trip-activity-personal-component.scss',
})
export class TripActivityPersonalComponent implements OnInit {
  tripActivityItemComponent = TripActivityPersonalItemComponent;
  componentId = 'trip-activities-personal';
  componentService = inject(ComponentService);
  tripActivityService = inject(TripActivityService);
  itineraryService = inject(ItineraryService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(DynamicQueryService);

  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private tripId: string | null = null;

  itineraryPartsVisible = signal<boolean>(true);

  menuItems = computed<MenuConfig[]>(() => [
    {
      label: `${this.itineraryPartsVisible() ? 'Hide' : 'Show'} Itinerary Parts`,
      icon: 'map',
      action: () => {
        this.itineraryPartsVisible.set(!this.itineraryPartsVisible());
        this.localStorageService.setComponentKey(this.componentId, 'itineraryPartsVisible', this.itineraryPartsVisible());
      },
    },
  ]);

  conditions: Condition[] = [
    {
      kind: 'sort',
      label: 'Sort by Name',
      icon: 'sort-alt',
      property: 'name',
      sortType: 'text',
      direction: 'none',
    },
    {
      kind: 'filter',
      property: 'name',
      label: 'Filter by Name',
      filterText: '',
      comparisonType: 'contains',
      icon: 'filter',
      isSelected: true,
    },
    {
      kind: 'filter',
      property: 'activity',
      label: 'Activity',
      filterText: '',
      comparisonType: 'exact',
      icon: 'filter',
    },
  ];

  itemMetaData: any = {
    itineraryPartsVisible: this.itineraryPartsVisible,
    assignItineraryPart: this.assignItineraryPart.bind(this),
  };

  ngOnInit(): void {
    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.initConditions(this.componentId);

    this.itineraryService.getAll(this.tripId).pipe(
      map((parts: ItineraryPartDto[]) => sortTripActivityItineraryParts(parts)),
      tap((parts: ItineraryPartDto[]) => {
        this.itemMetaData.itineraryParts = parts.map((part) => ({ id: part.id, name: part.name }));
      }),
      switchMap((parts: ItineraryPartDto[]) =>
        this.tripActivityService.getAllPersonal(this.tripId!).pipe(
          map((activities: TripActivityDto[]) => enrichTripActivities(activities, parts))
        )
      ),
      tap((activities: TripActivityDto[]) => {
        this.initSavedFeatures(activities);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((activities) => {
      this.componentService.updateEntities(activities || []);
    });
  }

  initSavedFeatures(items: TripActivityDto[]) {
    const actionsVisible = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(actionsVisible);

    let id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    if (!items || !items.find((item) => item.id === id)) {
      id = null;
    }
    this.componentService.updateSelectedId(id);

    const itineraryPartsVisible = this.localStorageService.getComponentBooleanKey(this.componentId, 'itineraryPartsVisible', true);
    this.itineraryPartsVisible.set(itineraryPartsVisible);
  }

  initConditions(componentId: string | null): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }

    const savedConditions = this.localStorageService.getComponentKeyObject(componentId, 'conditions') || [];
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);
    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }

  deleteTripActivity(id: string): void {
    this.tripActivityService.deletePersonal(id).pipe(
      switchMap(() => this.itineraryService.getAll(this.tripId!)),
      map((parts: ItineraryPartDto[]) => sortTripActivityItineraryParts(parts)),
      switchMap((parts: ItineraryPartDto[]) =>
        this.tripActivityService.getAllPersonal(this.tripId!).pipe(
          map((activities: TripActivityDto[]) => enrichTripActivities(activities, parts))
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((activities) => {
      this.componentService.updateEntities(activities);
    });
  }

  assignItineraryPart(entity: TripActivityDto, itineraryPartId: string | null): void {
    const request: UpdateTripActivityRequest = {
      id: entity.id,
      itineraryPartId,
      activity: entity.activity ?? null,
      name: entity.name,
      startDate: entity.startDate ?? null,
      endDate: entity.endDate ?? null,
      address: entity.address ?? null,
      latitude: entity.latitude ?? null,
      longitude: entity.longitude ?? null,
      notes: entity.notes ?? null,
    };

    this.tripActivityService.updatePersonal(request).pipe(
      switchMap(() => this.itineraryService.getAll(this.tripId!)),
      map((parts: ItineraryPartDto[]) => sortTripActivityItineraryParts(parts)),
      switchMap((parts: ItineraryPartDto[]) =>
        this.tripActivityService.getAllPersonal(this.tripId!).pipe(
          map((activities: TripActivityDto[]) => enrichTripActivities(activities, parts))
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((activities) => {
      this.componentService.updateEntities(activities);
    });
  }
}