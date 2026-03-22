import { Component, computed, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { ComponentService } from '../../services/component-service';
import { AppService } from '../../services/app-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { CurrentTripService } from '../../services/current-trip-service';
import { UsersService } from '../../services/users-service';
import { TripDto, TripService } from '../../services/trip-service';
import { Condition, Target, TargetCondition, TargetMode } from '../../services/dynamic-query-service';
import { MultipleIdsRequest } from '../../services/crud-service';
import { TodoDto, TodoService } from '../../services/todo-service';
import { TripTodoService } from '../../services/trip-todo-service';
import { TripSharedTodoService } from '../../services/trip-shared-todo-service';
import { TodoItemComponent } from './todos-item/todo-item-component';

@Component({
  selector: 'app-todos',
  imports: [
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent,
  ],
  templateUrl: './todos-component.html',
  styleUrl: './todos-component.scss',
})
export class TodosComponent {
  todoItemComponent = TodoItemComponent;
  componentId = 'todos';
  appService = inject(AppService);
  tripService = inject(TripService);
  router = inject(Router);
  componentService = inject(ComponentService);
  todoService = inject(TodoService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(ComponentService).dynamicQueryService;
  tripTodoService = inject(TripTodoService);
  tripSharedTodoService = inject(TripSharedTodoService);
  targetCondition = toSignal(this.componentService.targetCondition$);
  target = toSignal(this.componentService.target$);
  targetedIds = toSignal(this.componentService.targetedIds$);
  notTargetedIds = toSignal(this.componentService.notTargetedIds$);
  usersService = inject(UsersService);
  currentTripService = inject(CurrentTripService);
  currentTripDtoSignal = toSignal(this.currentTripService.currentTripDto$, { initialValue: null });

  private destroyRef = inject(DestroyRef);

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
      kind: 'target',
      label: 'Trip todos',
      icon: 'compass',
      target: null,
    },
    {
      kind: 'filter',
      property: 'category',
      label: 'Category',
      filterText: '',
      comparisonType: 'exact',
      icon: 'folder-open',
    },
    {
      kind: 'filter',
      property: 'name',
      label: 'Filter by Name',
      filterText: '',
      comparisonType: 'contains',
      isSelected: true,
      icon: 'check-square',
    },
  ];

  menuItems = computed<MenuConfig[]>(() => []);

  ngOnInit(): void {
    this.componentService.updateComponentId(this.componentId);

    const trips$ = this.usersService.isAdminSignal()
      ? this.tripService.getAll()
      : this.tripService.getAllWhereParticipant();

    trips$.pipe(
      tap((trips: TripDto[]) => {
        this.initConditions(this.componentId, trips);
        this.initTargetLookup(trips);
      }),
      switchMap(() =>
        this.componentService.target$.pipe(
          switchMap((target: Target | null) => {
            if (target && target.selectedMode === TargetMode.TripSharedTodos) {
              return this.todoService.getAllForSharedTrip(target.id!);
            }
            if (target && target.id) {
              return this.todoService.getAllForTrip(target.id);
            }
            return this.todoService.getAll();
          })
        )
      ),
      tap((items: TodoDto[]) => {
        this.initSavedFeatures(items);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((todos) => this.componentService.updateEntities(todos || []));
  }

  initSavedFeatures(items: TodoDto[]) {
    const actionsVisible = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(actionsVisible);

    let id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    if (!items || !items.find(x => x.id === id)) {
      id = null;
    }

    this.componentService.updateSelectedId(id);
  }

  initTargetLookup(trips: TripDto[] | null) {
    if (!trips) {
      this.componentService.updateTargetLookup([]);
      return;
    }

    const lookup = trips
      .sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''))
      .map((trip: TripDto) => {
        const result: Target = {
          id: trip.id,
          name: trip.name,
          selectedMode: null,
          options: null,
        };

        if (this.usersService.isAdminSignal()) {
          result.selectedMode = TargetMode.TripSharedTodos;
          result.options = [
            {
              label: 'Shared',
              mode: TargetMode.TripSharedTodos,
            },
          ];

          if (trip.currentUserIncluded) {
            result.options.push({
              label: 'Own',
              mode: TargetMode.TripTodos,
            });
          }
        }

        return result;
      });

    this.componentService.updateTargetLookup(lookup);
  }

  getTargetByTrip(trip: TripDto) {
    const result: Target = {
      id: trip.id,
      name: trip.name,
      selectedMode: null,
      options: null,
    };

    if (this.usersService.isAdminSignal()) {
      result.selectedMode = TargetMode.TripSharedTodos;
      result.options = [
        {
          label: 'Shared',
          mode: TargetMode.TripSharedTodos,
        },
      ];
      if (trip.currentUserIncluded) {
        result.options.push({
          label: 'Own',
          mode: TargetMode.TripTodos,
        });
      }
    }

    return result;
  }

  initConditions(componentId: string | null, trips: TripDto[] | null = null): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }
    const savedConditions = this.localStorageService.getComponentKeyObject(componentId, 'conditions') || [];
    const savedTargetCondition: TargetCondition | undefined = savedConditions.find(c => c.kind === 'target');
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);
    const targetCondition: TargetCondition | undefined = initialConditions.find(c => c.kind === 'target');

    if (targetCondition) {
      const trip = trips?.find(t => t.id === targetCondition.target?.id);
      if (trip) {
        targetCondition.target = this.getTargetByTrip(trip);
      } else {
        targetCondition.target = null;
        const currentTrip = this.currentTripDtoSignal();
        if (currentTrip && trips?.find(t => t.id === currentTrip.id)) {
          targetCondition.target = this.getTargetByTrip(currentTrip);
        }
      }

      if (
        savedTargetCondition?.target?.selectedMode &&
        targetCondition.target?.options?.map(x => x.mode).includes(savedTargetCondition.target.selectedMode)
      ) {
        targetCondition.target.selectedMode = savedTargetCondition.target.selectedMode;
      }
    }

    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }

  onAddTargetClick(): void {
    const target = this.target();
    const targetId = target?.id;

    if (!targetId) {
      throw new Error('Target Trip Id is not set');
    }
    const ids = this.notTargetedIds();
    if (!ids || ids.length === 0) {
      throw new Error('No not targeted ids available');
    }
    const request: MultipleIdsRequest = {
      collectionId: targetId,
      ids,
    };

    const operation$ = target?.selectedMode === TargetMode.TripSharedTodos
      ? this.tripSharedTodoService.addFromDic(request)
      : this.tripTodoService.addFromDic(request);

    const refresh$ = target?.selectedMode === TargetMode.TripSharedTodos
      ? this.todoService.getAllForSharedTrip(targetId)
      : this.todoService.getAllForTrip(targetId);

    operation$.pipe(
      switchMap(() => refresh$),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((todos) => {
      this.componentService.updateEntities(todos);
    });
  }

  onDeleteTargetClick(): void {
    const target = this.target();
    const targetId = target?.id;

    if (!targetId) {
      throw new Error('Target Trip Id is not set');
    }
    const ids = this.targetedIds();
    if (!ids || ids.length === 0) {
      throw new Error('No targeted ids available');
    }
    const request: MultipleIdsRequest = {
      collectionId: targetId,
      ids,
    };

    const operation$ = target?.selectedMode === TargetMode.TripSharedTodos
      ? this.tripSharedTodoService.deleteFromDic(request)
      : this.tripTodoService.deleteFromDic(request);

    const refresh$ = target?.selectedMode === TargetMode.TripSharedTodos
      ? this.todoService.getAllForSharedTrip(targetId)
      : this.todoService.getAllForTrip(targetId);

    operation$.pipe(
      switchMap(() => refresh$),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((todos) => {
      this.componentService.updateEntities(todos);
    });
  }

  deleteTodo(id: string): void {
    this.todoService.delete(id).pipe(
      switchMap(() => this.componentService.target$),
      switchMap((target) => {
        const tripId = target?.id;
        if (!tripId) {
          return this.todoService.getAll();
        }
        if (target?.selectedMode === TargetMode.TripSharedTodos) {
          return this.todoService.getAllForSharedTrip(tripId);
        }
        return this.todoService.getAllForTrip(tripId);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((todos) => {
      this.componentService.updateEntities(todos);
    });
  }

  targetEntityClick(entity: TodoDto) {
    const target = this.target();
    const request: MultipleIdsRequest = {
      collectionId: target!.id!,
      ids: [entity.id],
    };

    const targeted = !!entity.isTargeted;
    const operation$ = target?.selectedMode === TargetMode.TripSharedTodos
      ? (targeted ? this.tripSharedTodoService.deleteFromDic(request) : this.tripSharedTodoService.addFromDic(request))
      : (targeted ? this.tripTodoService.deleteFromDic(request) : this.tripTodoService.addFromDic(request));

    const refresh$ = target?.selectedMode === TargetMode.TripSharedTodos
      ? this.todoService.getAllForSharedTrip(target!.id!)
      : this.todoService.getAllForTrip(target!.id!);

    operation$.pipe(
      switchMap(() => refresh$),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((todos) => {
      this.componentService.updateEntities(todos);
    });
  }
}