import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { Condition, DynamicQueryService } from '../../services/dynamic-query-service';
import { TripActivityService } from '../../services/trip-activity-service';
import { DocumentsService } from '../../services/documents-service';
import { TripNoteDto, TripNoteService, UpdateTripNoteRequest } from '../../services/trip-note-service';
import { TripNoteItemComponent } from './trip-note-item/trip-note-item-component';
import { buildTripNoteActivityOptions } from './trip-note-utils';

@Component({
  selector: 'app-trip-notes',
  standalone: true,
  imports: [EntitiesComponent, EntitiesHeader, EntitiesActionsComponent],
  templateUrl: './trip-notes-component.html',
  styleUrl: './trip-notes-component.scss',
})
export class TripNotesComponent implements OnInit {
  tripNoteItemComponent = TripNoteItemComponent;
  componentId = 'trip-notes';
  componentService = inject(ComponentService);
  tripNoteService = inject(TripNoteService);
  tripActivityService = inject(TripActivityService);
  documentsService = inject(DocumentsService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(DynamicQueryService);

  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private tripId: string | null = null;

  activityAssignmentsVisible = signal<boolean>(true);
  markedIds = signal<string[]>([]);

  menuItems = computed<MenuConfig[]>(() => [
    {
      label: `${this.activityAssignmentsVisible() ? 'Hide' : 'Show'} Activity Select`,
      icon: 'map',
      action: () => {
        this.activityAssignmentsVisible.set(!this.activityAssignmentsVisible());
        this.localStorageService.setComponentKey(this.componentId, 'activityAssignmentsVisible', this.activityAssignmentsVisible());
      },
    },
    {
      label: 'Download Marked Notes PDF',
      icon: 'download',
      disabled: this.markedIds().length === 0,
      action: () => this.downloadMarkedNotesPdf(),
    },
  ]);

  conditions: Condition[] = [
    {
      kind: 'sort',
      label: 'Sort by Title',
      icon: 'sort-alt',
      property: 'title',
      sortType: 'text',
      direction: 'none',
    },
    {
      kind: 'filter',
      property: 'title',
      label: 'Filter by Title',
      filterText: '',
      comparisonType: 'contains',
      isSelected: true,
      icon: 'filter',
    },
    {
      kind: 'filter',
      property: 'tripActivityName',
      label: 'Activity',
      filterText: '',
      comparisonType: 'contains',
      icon: 'filter',
    },
  ];

  itemMetaData: any = {
    activityAssignmentsVisible: this.activityAssignmentsVisible,
    activityOptions: [],
    assignTripActivity: this.assignTripActivity.bind(this),
    isMarked: (id: string) => this.markedIds().includes(id),
    toggleMarked: this.toggleMarked.bind(this),
  };

  ngOnInit(): void {
    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.initConditions(this.componentId);

    this.loadNotes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((notes) => {
      this.componentService.updateEntities(notes || []);
    });
  }

  private loadNotes() {
    return combineLatest([
      this.tripActivityService.getAllPublic(this.tripId!),
      this.tripActivityService.getAllPersonal(this.tripId!),
      this.tripNoteService.getAll(this.tripId!),
    ]).pipe(
      map(([publicActivities, personalActivities, notes]) => ({
        activityOptions: buildTripNoteActivityOptions(publicActivities, personalActivities),
        notes,
      })),
      tap(({ activityOptions, notes }) => {
        this.itemMetaData.activityOptions = activityOptions;
        this.initSavedFeatures(notes);
      }),
      map(({ notes }) => notes)
    );
  }

  initSavedFeatures(items: TripNoteDto[]) {
    const actionsVisible = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(actionsVisible);

    let id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    if (!items || !items.find((item) => item.id === id)) {
      id = null;
    }
    this.componentService.updateSelectedId(id);

    const activityAssignmentsVisible = this.localStorageService.getComponentBooleanKey(this.componentId, 'activityAssignmentsVisible', true);
    this.activityAssignmentsVisible.set(activityAssignmentsVisible);

    this.markedIds.set(this.markedIds().filter((markedId) => items.some((item) => item.id === markedId)));
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

  deleteTripNote(id: string): void {
    this.tripNoteService.delete(id, this.tripId!).pipe(
      switchMap(() => this.loadNotes()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((notes) => {
      this.componentService.updateEntities(notes);
    });
  }

  assignTripActivity(entity: TripNoteDto, tripActivityId: string | null): void {
    const request: UpdateTripNoteRequest = {
      id: entity.id,
      tripId: this.tripId!,
      tripActivityId,
      title: entity.title,
      contentJson: entity.contentJson ?? null,
      noteOrder: entity.noteOrder ?? null,
    };

    this.tripNoteService.update(request).pipe(
      switchMap(() => this.loadNotes()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((notes) => {
      this.componentService.updateEntities(notes);
    });
  }

  toggleMarked(id: string, checked: boolean): void {
    const next = new Set(this.markedIds());
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }

    this.markedIds.set([...next]);
  }

  private downloadMarkedNotesPdf(): void {
    const ids = this.markedIds();
    if (!this.tripId || ids.length === 0) {
      return;
    }

    this.documentsService.getTripNotesPdf(this.tripId, ids).subscribe((blob) => {
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `trip-notes-${this.tripId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    });
  }
}