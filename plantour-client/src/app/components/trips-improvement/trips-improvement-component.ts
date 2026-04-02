import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, map, switchMap, tap } from 'rxjs';
import { getMessageFromError } from '../../helpers/utils';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, HeaderButtonConfig, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { ComponentService } from '../../services/component-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { Condition, DynamicQueryService } from '../../services/dynamic-query-service';
import { TripImprovementDto, TripImprovementService } from '../../services/trip-improvement-service';
import { MessagesService } from '../../services/messages-service';
import { TripsAiService } from '../../services/trips-ai-service';
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
  messagesService = inject(MessagesService);
  tripsAiService = inject(TripsAiService);

  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private tripId: string | null = null;
  private readonly expandedRows = signal<Record<string, boolean>>({});
  private readonly visibleImprovements = signal<TripImprovementDto[]>([]);
  readonly isGenerating = signal(false);
  readonly allExpanded = computed(() => {
    const items = this.visibleImprovements();
    return items.length > 0 && items.every(item => !!this.expandedRows()[item.id]);
  });
  readonly allCollapsed = computed(() => {
    const items = this.visibleImprovements();
    return items.length === 0 || items.every(item => !this.expandedRows()[item.id]);
  });
  readonly headerButtons = computed<HeaderButtonConfig[]>(() => [
    {
      label: 'Ask AI',
      icon: 'sparkles',
      action: () => {
        void this.askAi();
      },
      disabled: this.isGenerating(),
    },
  ]);
  readonly menuItems = computed<MenuConfig[]>(() => {
    return [
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

    this.loadImprovements().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
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
      switchMap(() => this.loadImprovements()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  toggleFinishedClick(entity: TripImprovementDto): void {
    this.tripImprovementService.toggleFinished({
      id: entity.id,
      tripId: this.tripId!,
      finished: entity.finished ?? null,
    }).pipe(
      switchMap(() => this.loadImprovements()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  async askAi(): Promise<void> {
    if (!this.tripId || this.isGenerating()) {
      return;
    }

    const startResult = await this.messagesService.openOkCancel({
      title: 'Ask AI',
      message: 'Ask Plantour AI to analyze this trip and generate improvement suggestions?',
      okLabel: 'Ask AI',
      cancelLabel: 'Cancel',
    });

    if (startResult !== 'ok') {
      return;
    }

    const existingCount = this.visibleImprovements().length;
    let replaceExisting = false;

    if (existingCount > 0) {
      const dialogResult = await this.messagesService.openYesNoCancel({
        title: 'Existing improvements found',
        message: `This trip already has ${existingCount} saved improvements for you. Delete them first? Choose No to keep them and append the new AI suggestions.`,
        yesLabel: 'Delete old ones',
        noLabel: 'Keep and append',
        cancelLabel: 'Cancel',
      });

      if (dialogResult === 'cancel') {
        return;
      }

      replaceExisting = dialogResult === 'yes';
    }

    this.isGenerating.set(true);
    this.tripsAiService.generateTripImprovements({
      tripId: this.tripId,
      replaceExisting,
    }).pipe(
      switchMap(response => this.loadImprovements().pipe(map(() => response))),
      finalize(() => this.isGenerating.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: response => {
        const deletedText = response.deletedExistingCount > 0
          ? ` Replaced ${response.deletedExistingCount} older improvements.`
          : existingCount > 0
            ? ' Added the new suggestions after your existing list.'
            : '';

        this.messagesService.showInfo(`Generated ${response.improvements.length} trip improvements.${deletedText}`);
      },
      error: error => {
        this.messagesService.showError(getMessageFromError(error, 'AI trip improvements failed'));
      }
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

  private loadImprovements() {
    return this.tripImprovementService.getAll(this.tripId!).pipe(
      tap((improvements: TripImprovementDto[]) => {
        const items = improvements || [];
        items.forEach(improvement => this.decorateImprovement(improvement));
        this.syncExpandedRows(items);
        this.initSavedFeatures(items);
        this.visibleImprovements.set(items);
        this.componentService.updateEntities(items);
      })
    );
  }
}