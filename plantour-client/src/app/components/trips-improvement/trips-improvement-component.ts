import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader } from '../entities/entities-header-component/entities-header-component';
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
  private destroyRef = inject(DestroyRef);
  private tripId: string | null = null;

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
  ];

  itemMetaData = {
    toggleFinished: this.toggleFinishedClick.bind(this),
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
        this.initSavedFeatures(improvements);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((improvements) => {
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
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((improvements) => {
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
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((improvements) => {
      this.componentService.updateEntities(improvements);
    });
  }

  private decorateImprovement(improvement: TripImprovementDto): void {
    if (improvement.finished === 'success') {
      improvement.reviewStatusText = 'Accepted';
      return;
    }

    if (improvement.finished === 'failure') {
      improvement.reviewStatusText = 'Rejected';
      return;
    }

    improvement.reviewStatusText = 'No decision yet';
  }
}