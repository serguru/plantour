import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap, tap } from 'rxjs';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { Condition, DynamicQueryService } from '../../services/dynamic-query-service';
import { ItineraryPartDto, ItineraryService } from '../../services/itinerary-service';
import { TripItineraryItemComponent } from './trip-itinerary-item/trip-itinerary-item-component';
import { LocalStorageService } from '../../services/local-storage-service';
import { MessagesService } from '../../services/messages-service';

@Component({
  selector: 'app-trip-itinerary',
  standalone: true,
  imports: [EntitiesComponent, EntitiesHeader, EntitiesActionsComponent],
  templateUrl: './trip-itinerary-component.html',
  styleUrl: './trip-itinerary-component.scss',
})
export class TripItineraryComponent implements OnInit {
  readonly itineraryItemComponent = TripItineraryItemComponent;
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly componentId = 'trip-itinerary';
  readonly componentService = inject(ComponentService);
  readonly itineraryService = inject(ItineraryService);
  readonly dynamicQueryService = inject(DynamicQueryService);
  readonly localStorageService = inject(LocalStorageService);
  readonly messagesService = inject(MessagesService);

  private tripId: string | null = null;

  readonly conditions: Condition[] = [
    {
      kind: 'sort',
      label: 'Sort by Start Date',
      icon: 'sort-alt',
      property: 'startDate',
      sortType: 'text',
      direction: 'asc',
    },
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
      isSelected: true,
      icon: 'filter',
    },
    {
      kind: 'filter',
      property: 'category',
      label: 'Category',
      filterText: '',
      comparisonType: 'exact',
      icon: 'filter',
    },
  ];

  readonly menuItems = computed<MenuConfig[]>(() => []);

  ngOnInit(): void {
    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.initConditions(this.componentId);
    this.refresh();
  }

  private refresh(): void {
    this.itineraryService.getAll(this.tripId!).pipe(
      map((parts) => [...parts].sort((a, b) => {
        const startDateComparison = (a.startDate || '').localeCompare(b.startDate || '');
        return startDateComparison !== 0 ? startDateComparison : a.name.localeCompare(b.name);
      })),
      tap((parts: ItineraryPartDto[]) => {
        this.initSavedFeatures(parts);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((parts) => {
      this.componentService.updateEntities(parts || []);
    });
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

  deletePart(id: string): void {
    if (!this.tripId) {
      return;
    }

    this.itineraryService.delete(id, this.tripId).pipe(
      switchMap(() => this.itineraryService.getAll(this.tripId!)),
      map((parts) => [...parts].sort((a, b) => {
        const startDateComparison = (a.startDate || '').localeCompare(b.startDate || '');
        return startDateComparison !== 0 ? startDateComparison : a.name.localeCompare(b.name);
      })),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((parts) => {
      this.messagesService.showInfo('Itinerary part deleted successfully');
      this.componentService.updateEntities(parts || []);
    });
  }

  initSavedFeatures(items: ItineraryPartDto[]): void {
    const actionsVisible = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(actionsVisible);

    let id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    if (!items.find((item) => item.id === id)) {
      id = null;
    }

    this.componentService.updateSelectedId(id);
  }
}