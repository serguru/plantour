import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, switchMap, tap } from 'rxjs';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { Condition, DynamicQueryService } from '../../services/dynamic-query-service';
import { AssignmentStatus } from '../../helpers/enums';
import { formatDate, getDaysDifference } from '../../helpers/utils';
import { TripTodoDto, TripTodoService } from '../../services/trip-todo-service';
import { TripTodoItemComponent } from './trip-todo-item/trip-todo-item-component';
import { ItineraryPartDto, ItineraryService } from '../../services/itinerary-service';

@Component({
  selector: 'app-trip-todos',
  standalone: true,
  imports: [
    EntitiesComponent,
    EntitiesHeader,
  ],
  templateUrl: './trip-todos-component.html',
  styleUrl: './trip-todos-component.scss',
})
export class TripTodosComponent implements OnInit {
  tripTodoItemComponent = TripTodoItemComponent;
  componentId = 'trip-todos';
  componentService = inject(ComponentService);
  tripTodoService = inject(TripTodoService);
  itineraryService = inject(ItineraryService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(DynamicQueryService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private tripId: string | null = null;

  assignmentsVisible = signal<boolean>(true);
  itineraryPartsVisible = signal<boolean>(true);

  menuItems = computed<MenuConfig[]>(() => [
    {
      label: `${this.assignmentsVisible() ? 'Hide' : 'Show'} Assignments`,
      icon: 'check',
      action: () => {
        this.assignmentsVisible.set(!this.assignmentsVisible());
        this.localStorageService.setComponentKey(this.componentId, 'assignmentsVisible', this.assignmentsVisible());
      },
    },
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
      isSelected: true,
      icon: 'filter',
    },
    {
      kind: 'filter',
      property: 'assignmentStatusName',
      label: 'Assignment Status',
      filterText: '',
      comparisonType: 'exact',
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

  itemMetaData: any = {
    assignmentsVisible: this.assignmentsVisible,
    toggleFinished: this.toggleFinishedClick.bind(this),
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
      tap((parts: ItineraryPartDto[]) => {
        this.itemMetaData.itineraryParts = parts
          .map((part) => ({ id: part.id, name: part.name }))
          .sort((a, b) => a.name.localeCompare(b.name));
      }),
      switchMap(() => this.tripTodoService.getAll(this.tripId!)),
      map((tripTodos: TripTodoDto[]) => {
        tripTodos.forEach(todo => this.generateMessagesData(todo));
        return tripTodos;
      }),
      tap((tripTodos: TripTodoDto[]) => {
        this.initSavedFeatures(tripTodos);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripTodos) => {
      this.componentService.updateEntities(tripTodos || []);
    });
  }

  initSavedFeatures(items: TripTodoDto[]) {
    const actionsVisible = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(actionsVisible);

    let id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    if (!items || !items.find(x => x.id === id)) {
      id = null;
    }
    this.componentService.updateSelectedId(id);

    const assignmentsVisible = this.localStorageService.getComponentBooleanKey(this.componentId, 'assignmentsVisible', true);
    this.assignmentsVisible.set(assignmentsVisible);

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

  deleteTripTodo(id: string): void {
    this.tripTodoService.delete(id, this.tripId!).pipe(
      switchMap(() => this.tripTodoService.getAll(this.tripId!)),
      map((tripTodos: TripTodoDto[]) => {
        tripTodos.forEach(todo => this.generateMessagesData(todo));
        return tripTodos;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripTodos) => {
      this.componentService.updateEntities(tripTodos);
    });
  }

  generateMessagesData = (todo: TripTodoDto) => {
    todo.assignmentStatus = AssignmentStatus.NotAssigned;
    todo.assignmentStatusName = 'Not Assigned';
    todo.assignmentStatusText = 'Not shared';

    if (!todo.tripSharedTodoId) {
      return;
    }

    const parts: string[] = [];

    if (todo.assignedAt) {
      parts.push(`Assigned on ${formatDate(todo.assignedAt)}`);
    }

    parts.push('Accepted');

    let deadlineString = '';
    if (todo.assignedDeadline) {
      const daysDiff = getDaysDifference(todo.assignedDeadline);
      if (daysDiff! < 0) {
        deadlineString = ` Deadline was: ${formatDate(todo.assignedDeadline)}, ${Math.abs(daysDiff!)} days ago.`;
      } else if (daysDiff === 0) {
        deadlineString = ' Deadline is today.';
      } else {
        deadlineString = ` Deadline: ${formatDate(todo.assignedDeadline)} in ${daysDiff} days.`;
      }
    }

    if (todo.finished === 'success') {
      parts.push('Finished successfully');
      todo.assignmentStatus = AssignmentStatus.FinishedSuccess;
      todo.assignmentStatusName = 'Finished, Success';
      todo.assignmentStatusText = parts.join('. ');
      return;
    }

    if (todo.finished === 'failure') {
      parts.push('Finished and failed');
      todo.assignmentStatus = AssignmentStatus.FinishedFailure;
      todo.assignmentStatusName = 'Finished, Failed';
      if (deadlineString) {
        parts.push(deadlineString);
      }
      todo.assignmentStatusText = parts.join('. ');
      return;
    }

    todo.assignmentStatus = AssignmentStatus.AssignedNotFinished;
    todo.assignmentStatusName = 'Assigned, Not Finished';
    parts.push('Not finished yet');
    if (deadlineString) {
      parts.push(deadlineString);
    }
    todo.assignmentStatusText = parts.join('. ');
  };

  toggleFinishedClick(entity: TripTodoDto): void {
    const transport = {
      id: entity.id,
      tripId: this.tripId!,
      finished: entity.finished,
    };
    this.tripTodoService.toggleFinished(transport).pipe(
      switchMap(() => this.tripTodoService.getAll(this.tripId!)),
      map((tripTodos: TripTodoDto[]) => {
        tripTodos.forEach(todo => this.generateMessagesData(todo));
        return tripTodos;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripTodos) => {
      this.componentService.updateEntities(tripTodos);
    });
  }

  assignItineraryPart(entity: TripTodoDto, itineraryPartId: string | null): void {
    const request = {
      id: entity.id,
      tripId: this.tripId!,
      itineraryPartId,
      category: entity.category ?? null,
      name: entity.name,
      notes: entity.notes ?? null,
    };

    this.tripTodoService.update(request).pipe(
      switchMap(() => this.tripTodoService.getAll(this.tripId!)),
      map((tripTodos: TripTodoDto[]) => {
        tripTodos.forEach(todo => this.generateMessagesData(todo));
        return tripTodos;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripTodos) => {
      this.componentService.updateEntities(tripTodos);
    });
  }
}