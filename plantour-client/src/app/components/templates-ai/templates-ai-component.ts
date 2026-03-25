import { Component, computed, DestroyRef, ErrorHandler, inject, signal } from '@angular/core';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { EntitiesComponent } from '../entities/entities-component';
import { TripDto, TripService } from '../../services/trip-service';
import { AppService } from '../../services/app-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ComponentService } from '../../services/component-service';
import { TripSharedService } from '../../services/trip-shared-service';
import { TripThingService } from '../../services/trip-thing-service';
import { BehaviorSubject, catchError, combineLatest, concatMap, debounceTime, forkJoin, of, Subject, switchMap, tap, throwError } from 'rxjs';
import { ThingService } from '../../services/thing-service';
import { UsersService } from '../../services/users-service';
import { Condition, Target, TargetCondition, TargetMode } from '../../services/dynamic-query-service';
import { ArrayOfGuidsRequest, MultipleIdsRequest } from '../../services/crud-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { CurrentTripService } from '../../services/current-trip-service';
import { Router } from '@angular/router';
import { TemplatesAiItemComponent } from './templates-ai-item/templates-ai-item-component';
import { AiItemDto, AiPromptDto, TemplatesAiService } from '../../services/template-ai-service';
import { Select } from 'primeng/select';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppButton } from '../button/button-component';
import { MessagesService } from '../../services/messages-service';
import { LoadingService } from '../../services/loading-service';
import { Dropdown } from '../dropdown/dropdown-component';

@Component({
  selector: 'app-templates-ai',
  imports: [
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent,
    FormsModule,
    AppButton,
    Dropdown
  ],
  templateUrl: './templates-ai-component.html',
  styleUrl: './templates-ai-component.scss',
})
export class TemplatesAiComponent {
  templatesAiItemComponent = TemplatesAiItemComponent;
  componentId: string = 'templates-ai';
  appService = inject(AppService);
  tripService = inject(TripService);
  router = inject(Router);
  errorHandler = inject(ErrorHandler);

  componentService = inject(ComponentService);
  templateAiService = inject(TemplatesAiService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(ComponentService).dynamicQueryService;
  messagesService = inject(MessagesService);

  thingService = inject(ThingService);
  tripThingService = inject(TripThingService);
  tripSharedService = inject(TripSharedService);

  targetCondition = toSignal(this.componentService.targetCondition$);
  target = toSignal(this.componentService.target$);

  targetedIds = toSignal(this.componentService.targetedIds$);
  notTargetedIds = toSignal(this.componentService.notTargetedIds$);
  usersService = inject(UsersService);
  currentTripService = inject(CurrentTripService);
  currentTripDtoSignal = toSignal(this.currentTripService.currentTripDto$, { initialValue: null });

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
      }, {
        kind: 'target',
        label: 'Trip or items dic',
        icon: 'compass',
        target: null
      }, {
        kind: 'filter',
        property: 'category',
        label: 'Category',
        icon: 'folder-open',
        filterText: '',
        comparisonType: 'exact',
      }, {
        kind: 'filter',
        property: 'name',
        label: 'Filter by Name',
        filterText: '',
        comparisonType: 'contains',
        isSelected: true,
        icon: 'shopping-bag'
      }
    ];


  menuItems = computed<MenuConfig[]>(() => []);

  selectedPrompt: string | null = null;
  prompts: string[] | null = null;

  clickSubject = new BehaviorSubject<string | null>(null);

  isLoading = toSignal(inject(LoadingService).loading$, { initialValue: false });

  // 1. Helper method to keep the pipe clean
  private getTemplateApiCall(target: any, prompt: string | null) {
    const p = prompt || '';
    if (target?.selectedMode === TargetMode.DicThings) {
      return this.templateAiService.getAllForDic(p);
    }
    if (target?.selectedMode === TargetMode.TripShared) {
      return this.templateAiService.getAllForTripShared(target.id!, p);
    }
    if (target?.id) {
      return this.templateAiService.getAllForTrip(target.id, p);
    }
    return this.templateAiService.getAllByPrompt(p);
  }

  addPromptToLookup = (prompt: string) => {
    if (!prompt) {
      return;
    }
    prompt = prompt.trim();
    if (!prompt) {
      return;
    }

    if (!this.prompts) {
      this.prompts = [];
    }

    const index = this.prompts.findIndex(p => p?.toLowerCase() === prompt.toLowerCase());
    if (index === 0) {
      return;
    }
    if (index > 0) {
      this.prompts.splice(index, 1);
    }
    this.prompts.unshift(prompt);
  }

  ngOnInit(): void {

    this.componentService.updateComponentId(this.componentId);
    var o = this.usersService.isAdminSignal() ? this.tripService.getAll() : this.tripService.getAllWhereParticipant();
    var p = this.templateAiService.getLatestPrompts();

    forkJoin([o, p]).pipe(
      tap(([trips, prompts]) => {
        this.prompts = prompts.map(x => x.prompt);
        if (prompts && prompts.length > 0) {
          this.selectedPrompt = prompts[0].prompt;
          this.clickSubject.next(this.selectedPrompt);
        }
        this.initConditions(this.componentId, trips);
        this.initTargetLookup(trips);
      }),
      // switchMap to the long-lived interaction stream
      switchMap(() => combineLatest([this.componentService.target$, this.clickSubject])),

      // switchMap to the actual API calls
      switchMap(([target, prompt]) => {
        return this.getTemplateApiCall(target, prompt).pipe(
          tap(things => {
            if (things?.length > 0 && prompt) {
              this.addPromptToLookup(prompt)
            }
          }),
    
          catchError(err => {
            this.errorHandler.handleError(err);
            return of([]);
          }),
        )
      }),
      tap((p: AiItemDto[]) => {
        this.initSavedFeatures(p);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (things) => {
        this.componentService.updateEntities(things || []);
      }
    });
  }

  initSavedFeatures(items: AiItemDto[]) {
    const v = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    let id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    if(!items || !items.find(x => x.id === id)) {
      id = null;
    }
    this.componentService.updateSelectedId(id);
  }

  initTargetLookup(trips: TripDto[] | null) {

    const dicTarget: Target = {
      id: "00000000-0000-0000-0000-000000000000", //  this is required by the p-select component
      name: "Items Dictionary",
      selectedMode: TargetMode.DicThings,
      options: null
    }

    if (!trips) {
      this.componentService.updateTargetLookup([dicTarget]);
      return;
    }

    const lookup = (trips).sort((a, b) => {
      const aDate = a.startDate ?? '';
      const bDate = b.startDate ?? '';
      return aDate.localeCompare(bDate);
    }).map((t: TripDto) => {

      const result: Target = {
        id: t.id,
        name: t.name,
        selectedMode: null,
        options: null
      }

      if (this.usersService.isAdminSignal()) {

        dicTarget.options = [{
          label: 'Dictionary',
          mode: TargetMode.DicThings
        }];

        result.selectedMode = TargetMode.TripShared;
        result.options = [
          {
            label: 'Shared',
            mode: TargetMode.TripShared
          }
        ];

        if (t.currentUserIncluded) {
          result.options.push({
            label: 'Own',
            mode: TargetMode.TripThings

          })
        }
      }
      return result;
    });

    lookup.push(dicTarget);

    this.componentService.updateTargetLookup(lookup);
  }

  getTargetByTrip(trip: TripDto) {
    const result: Target = {
      id: trip.id,
      name: trip.name,
      selectedMode: null,
      options: null
    }
    if (this.usersService.isAdminSignal()) {
      result.selectedMode = TargetMode.TripShared;
      result.options = [
        {
          label: 'Shared',
          mode: TargetMode.TripShared
        }
      ];
      if (trip.currentUserIncluded) {
        result.options.push({
          label: 'Own',
          mode: TargetMode.TripThings
        })
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
      if (targetCondition.target?.selectedMode === TargetMode.DicThings) {
        targetCondition.target = {
          id: targetCondition.target.id,
          name: "Items Dictionary",
          selectedMode: TargetMode.DicThings,
          options: null
        };

        if (this.usersService.isAdminSignal()) {
          targetCondition.target.options = [{
            label: 'Dictionary',
            mode: TargetMode.DicThings
          }];
        }
      } else {
        const trip = trips?.find(t => t.id === targetCondition.target?.id);
        if (trip) {
          targetCondition.target = this.getTargetByTrip(trip);
        } else {
          targetCondition.target = null;
          const trip = this.currentTripDtoSignal();
          if (trip && trips?.find(t => t.id === trip.id)) {
            targetCondition.target = this.getTargetByTrip(trip);
          }
        }
        if (savedTargetCondition?.target?.selectedMode && targetCondition.target?.options?.map(x => x.mode).includes(savedTargetCondition.target.selectedMode)) {
          targetCondition.target.selectedMode = savedTargetCondition.target.selectedMode;
        };
      }
    }

    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }

  onAddTargetClick(): void {
    const target = this.target();

    if (!target) {
      throw new Error('Target is not set');
    }

    const ids = this.notTargetedIds();

    if (!ids || ids.length === 0) {
      throw new Error('No not targeted ids available');
    }

    if (target.selectedMode === TargetMode.DicThings) {
      const request: ArrayOfGuidsRequest = {
        ids: ids
      };

      this.thingService.addFromTemplateAi(request).pipe(
        switchMap(() => this.templateAiService.getAllForDic(this.selectedPrompt || '')),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe((things) => {
        this.componentService.updateEntities(things);
      });

      return;
    }


    const targetId = target.id;

    if (!targetId) {
      throw new Error('Target Trip Id is not set');
    }
    const request: MultipleIdsRequest = {
      collectionId: targetId,
      ids: ids
    };

    let o, m;

    if (target?.selectedMode === TargetMode.TripShared) {
      o = this.tripSharedService.addFromTemplateAi(request);
      m = this.templateAiService.getAllForTripShared(targetId, this.selectedPrompt || '');
    } else {
      o = this.tripThingService.addFromTemplateAi(request);
      m = this.templateAiService.getAllForTrip(targetId, this.selectedPrompt || '');
    }
    o.pipe(
      switchMap(() => m),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((things) => {
      this.componentService.updateEntities(things);
    });
  }

  onDeleteTargetClick(): void {

    const target = this.target();

    if (!target) {
      throw new Error('Target is not set');
    }

    const ids = this.targetedIds();
    if (!ids || ids.length === 0) {
      throw new Error('No targeted ids available');
    }

    if (target.selectedMode === TargetMode.DicThings) {
      const request: ArrayOfGuidsRequest = {
        ids: ids
      };

      this.thingService.deleteFromTemplateAi(request).pipe(
        switchMap(() => this.templateAiService.getAllForDic(this.selectedPrompt || '')),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe((things) => {
        this.componentService.updateEntities(things);
      });
      return;
    }


    const targetId = target?.id;

    if (!targetId) {
      throw new Error('Target Trip Id is not set');
    }
    const request: MultipleIdsRequest = {
      collectionId: targetId,
      ids: ids
    };

    let o, m;

    if (target?.selectedMode === TargetMode.TripShared) {
      o = this.tripSharedService.deleteFromTemplateAi(request);
      m = this.templateAiService.getAllForTripShared(targetId, this.selectedPrompt || '');
    } else {
      o = this.tripThingService.deleteFromTemplateAi(request);
      m = this.templateAiService.getAllForTrip(targetId, this.selectedPrompt || '');
    }
    o.pipe(
      switchMap(() => m),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((things) => {
      this.componentService.updateEntities(things);
    });
  }

  targetEntityClick(entity: any) {
    const target = this.target();

    if (!target) {
      throw new Error('Target is not set');
    }

    if (target.selectedMode === TargetMode.DicThings) {
      const request: ArrayOfGuidsRequest = {
        ids: [entity.id]
      };
      const o = entity.isTargeted ? this.thingService.deleteFromTemplateAi(request) : this.thingService.addFromTemplateAi(request);
      const m = this.templateAiService.getAllForDic(this.selectedPrompt || '');

      o.pipe(
        switchMap(() => m),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe((things) => {
        this.componentService.updateEntities(things);
      });
      return;
    }

    if (!target.id) {
      throw new Error('Target Trip Id is not set');
    }

    const request: MultipleIdsRequest = {
      collectionId: target.id,
      ids: [entity.id]
    };

    let o, m;

    if (target?.selectedMode === TargetMode.TripShared) {
      o = entity.isTargeted ? this.tripSharedService.deleteFromTemplateAi(request) : this.tripSharedService.addFromTemplateAi(request);
      m = this.templateAiService.getAllForTripShared(target!.id!, this.selectedPrompt || '');

    } else {
      o = entity.isTargeted ? this.tripThingService.deleteFromTemplateAi(request) : this.tripThingService.addFromTemplateAi(request);
      m = this.templateAiService.getAllForTrip(target!.id!, this.selectedPrompt || '');
    }

    o.pipe(
      switchMap(() => m),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((things) => {
      this.componentService.updateEntities(things);
    });
  }
}
