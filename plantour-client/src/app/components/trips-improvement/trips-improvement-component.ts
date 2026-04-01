import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { ComponentService } from '../../services/component-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { Condition, DynamicQueryService } from '../../services/dynamic-query-service';
import { TripImprovementDto, TripImprovementService } from '../../services/trip-improvement-service';
import { TripImprovementItemComponent } from './trip-improvement-item/trip-improvement-item-component';

@Component({
  selector: 'app-trips-improvement',
  standalone: true,
  imports: [
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent,
  ],
  templateUrl: './trips-improvement-component.html',
  styleUrl: './trips-improvement-component.scss',
})
export class TripsImprovementComponent implements OnInit {
  tripImprovementItemComponent = TripImprovementItemComponent;
  componentId = 'trips-improvement';
  componentService = inject(ComponentService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(DynamicQueryService);
  tripImprovementService = inject(TripImprovementService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private tripId: string | null = null;
  private readonly expandedRows = signal<Record<string, boolean>>({});
  private readonly visibleImprovements = signal<TripImprovementDto[]>([]);
  readonly allExpanded = computed(() => {
    const items = this.visibleImprovements();
    return items.length > 0 && items.every(item => !!this.expandedRows()[item.id]);
  });
  readonly allCollapsed = computed(() => {
    const items = this.visibleImprovements();
    return items.length === 0 || items.every(item => !this.expandedRows()[item.id]);
  });
  readonly menuItems = computed<MenuConfig[]>(() => {
    if (!this.tripId) {
      return [];
    }

    return [
      {
        label: 'Generate with AI',
        icon: 'sparkles',
        action: () => {
          void this.router.navigate([`/trips/${this.tripId}/trips-ai-improvement`]);
        }
      },
      {
        label: 'Expand all',
        icon: 'angle-double-down',
        action: () => this.expandAll(),
        disabled: this.allExpanded()
      },
      {
        label: 'Collapse all',
        icon: 'angle-double-up',
        action: () => this.collapseAll(),
        disabled: this.allCollapsed()
      }
    ];
  });

  conditions: Condition[] = [
    {
      kind: 'sort',
      label: 'Sort by Improvement Order',
      icon: 'sort-alt',
      property: 'improvementOrder',
      sortType: 'number',
      direction: 'asc',
      isSelected: true,
    },
    {
      kind: 'filter',
      property: 'name',
      label: 'Filter by Name',
      filterText: '',
      comparisonType: 'contains',
      icon: 'filter',
    },
    {
      kind: 'filter',
      property: 'finishedLookup',
      label: 'Filter by Finished',
      filterText: '',
      comparisonType: 'exact',
      icon: 'check-circle',
    },
  ];

  itemMetaData = {
    toggleFinished: this.toggleFinishedClick.bind(this),
    isExpanded: (id: string) => this.isExpanded(id),
    toggleExpanded: (id: string, expanded: boolean) => this.toggleExpanded(id, expanded),
  };

  ngOnInit(): void {
    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.initConditions(this.componentId);

    this.tripImprovementService.getAll(this.tripId).pipe(
      tap((improvements: TripImprovementDto[]) => {
        improvements.forEach(improvement => this.decorateImprovement(improvement));
        this.syncExpandedRows(improvements);
        this.initSavedFeatures(improvements);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((improvements) => {
      this.visibleImprovements.set(improvements || []);
      this.componentService.updateEntities(improvements || []);
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

  initSavedFeatures(items: TripImprovementDto[]) {
    const actionsVisible = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(actionsVisible);

    let id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    if (!items || !items.find(x => x.id === id)) {
      id = null;
    }
    this.componentService.updateSelectedId(id);
  }

  deleteTripImprovement(id: string): void {
    this.tripImprovementService.delete(id, this.tripId!).pipe(
      switchMap(() => this.tripImprovementService.getAll(this.tripId!)),
      tap((improvements: TripImprovementDto[]) => {
        improvements.forEach(improvement => this.decorateImprovement(improvement));
        this.syncExpandedRows(improvements);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((improvements) => {
      this.visibleImprovements.set(improvements || []);
      this.componentService.updateEntities(improvements);
    });
  }

  toggleFinishedClick(entity: TripImprovementDto): void {
    this.tripImprovementService.toggleFinished({
      id: entity.id,
      tripId: this.tripId!,
      finished: entity.finished ?? null,
    }).pipe(
      switchMap(() => this.tripImprovementService.getAll(this.tripId!)),
      tap((improvements: TripImprovementDto[]) => {
        improvements.forEach(improvement => this.decorateImprovement(improvement));
        this.syncExpandedRows(improvements);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((improvements) => {
      this.visibleImprovements.set(improvements || []);
      this.componentService.updateEntities(improvements);
    });
  }

  expandAll(): void {
    this.expandedRows.set(
      Object.fromEntries(this.visibleImprovements().map(item => [item.id, true]))
    );
  }

  collapseAll(): void {
    this.expandedRows.set(
      Object.fromEntries(this.visibleImprovements().map(item => [item.id, false]))
    );
  }

  isExpanded(id: string): boolean {
    return !!this.expandedRows()[id];
  }

  toggleExpanded(id: string, expanded: boolean): void {
    this.expandedRows.update(current => ({
      ...current,
      [id]: expanded,
    }));
  }

  private decorateImprovement(improvement: TripImprovementDto): void {
    if (improvement.finished === 'success') {
      improvement.reviewStatusText = 'Accepted';
      improvement.finishedLookup = 'accepted';
      return;
    }

    if (improvement.finished === 'failure') {
      improvement.reviewStatusText = 'Rejected';
      improvement.finishedLookup = 'rejected';
      return;
    }

    improvement.reviewStatusText = 'No decision yet';
    improvement.finishedLookup = 'not finished';
  }

  private syncExpandedRows(improvements: TripImprovementDto[]): void {
    const current = this.expandedRows();
    this.expandedRows.set(
      Object.fromEntries(improvements.map(item => [item.id, current[item.id] ?? false]))
    );
  }
}