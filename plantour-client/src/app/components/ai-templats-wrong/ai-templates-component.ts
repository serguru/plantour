import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, Observable, of, switchMap, tap } from 'rxjs';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { EntitiesComponent } from '../entities/entities-component';
import { AiTemplateItemComponent } from './ai-template-item/ai-template-item-component';
import { ComponentService } from '../../services/component-service';
import { CurrentTripService } from '../../services/current-trip-service';
import { Condition, Target, TargetCondition, TargetMode } from '../../services/dynamic-query-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { TemplateService, AIItemDto } from '../../services/template-service';
import { ThingService } from '../../services/thing-service';
import { TripDto, TripService } from '../../services/trip-service';
import { TripThingService } from '../../services/trip-thing-service';
import { TripSharedService } from '../../services/trip-shared-service';
import { UsersService } from '../../services/users-service';
import { AppButton } from '../button/button-component';

interface AiTemplateEntity {
  id: string;
  item_name: string;
  category: string;
  unit: string;
  value: number;
  recommendations: string;
  isTargeted?: boolean;
  targetId?: string | null;
}

@Component({
  selector: 'app-ai-templates-component',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent,
    AppButton
  ],
  templateUrl: './ai-templates-component.html',
  styleUrl: './ai-templates-component.scss',
})
export class AiTemplatesComponentWrong {
  aiTemplateItemComponent = AiTemplateItemComponent;
  componentId: string = 'ai-templates';
  tripService = inject(TripService);
  router = inject(Router);

  componentService = inject(ComponentService);
  templateService = inject(TemplateService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(ComponentService).dynamicQueryService;

  thingService = inject(ThingService);
  tripThingService = inject(TripThingService);
  tripSharedService = inject(TripSharedService);
  usersService = inject(UsersService);
  currentTripService = inject(CurrentTripService);

  promptText = 'I am going for safari to Africa for a week in a month. What items should I take?';
  lowerTextVisible = signal<boolean>(true);

  targetCondition = toSignal(this.componentService.targetCondition$);
  target = toSignal(this.componentService.target$);

  processedEntities = toSignal(this.componentService.processedEntities$, { initialValue: [] });

  currentTripDtoSignal = toSignal(this.currentTripService.currentTripDto$, { initialValue: null });
  loading = toSignal(this.componentService.loading$, { initialValue: false });

  private destroyRef = inject(DestroyRef);
  private aiItemsBase: AiTemplateEntity[] = [];
  private targetIndex = new Map<string, string>();

  conditions: Condition[] = [
    {
      kind: 'sort',
      label: 'Sort by Name',
      icon: 'sort-alt',
      property: 'item_name',
      sortType: 'text',
      direction: 'none'
    },
    {
      kind: 'target',
      label: 'Trip or dic things',
      icon: 'compass',
      target: null
    },
    {
      kind: 'filter',
      property: 'category',
      label: 'Category',
      icon: 'folder-open',
      filterText: '',
      comparisonType: 'exact'
    },
    {
      kind: 'filter',
      property: 'item_name',
      label: 'Filter by Name',
      filterText: '',
      comparisonType: 'contains',
      isSelected: true,
      icon: 'shopping-bag'
    }
  ];

  menuItems = computed<MenuConfig[]>(() => {
    return [
      {
        label: (this.lowerTextVisible() ? 'Hide' : 'Show') + ' Lower Text',
        icon: 'check',
        action: () => {
          this.lowerTextVisible.set(!this.lowerTextVisible());
          this.localStorageService.setComponentKey(this.componentId, 'lowerTextVisible', this.lowerTextVisible());
        }
      },
      {
        label: 'Help',
        icon: 'question-circle',
        action: () => {
          this.router.navigate(['/help/templates/templates-intro']);
        }
      }
    ];
  });

  itemMetaData: any = {
    lowerTextVisible: this.lowerTextVisible,
  };

  ngOnInit(): void {
    this.componentService.updateComponentId(this.componentId);

    const trips$ = this.usersService.isAdminSignal()
      ? this.tripService.getAll()
      : this.tripService.getAllWhereParticipant();

    trips$.pipe(
      tap((trips: TripDto[]) => {
        this.initConditions(this.componentId, trips);
        this.initTargetLookup(trips);
        this.initSavedFeatures();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();

    this.componentService.target$.pipe(
      switchMap(target => this.loadTargetItems(target)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((items) => {
      this.targetIndex = this.buildTargetIndex(items);
      this.applyTargetIndex();
    });

    this.componentService.updateEntities([]);
  }

  initSavedFeatures() {
    const v = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    const id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    this.componentService.updateSelectedId(id);

    const lowerTextVisible: boolean = this.localStorageService.getComponentKey(this.componentId, 'lowerTextVisible');
    this.lowerTextVisible.set(lowerTextVisible);
  }

  initTargetLookup(trips: TripDto[] | null) {
    const dicTarget: Target = {
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Items Dictionary',
      selectedMode: TargetMode.DicThings,
      options: null
    };

    if (!trips) {
      this.componentService.updateTargetLookup([dicTarget]);
      return;
    }

    const lookup = trips.sort((a, b) => {
      const aDate = a.startDate ?? '';
      const bDate = b.startDate ?? '';
      return aDate.localeCompare(bDate);
    }).map((t: TripDto) => {
      const result: Target = {
        id: t.id,
        name: t.name,
        selectedMode: null,
        options: null
      };

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
          });
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
    };

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
      if (targetCondition.target?.selectedMode === TargetMode.DicThings) {
        targetCondition.target = {
          id: null,
          name: 'Items Dictionary',
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
          const currentTrip = this.currentTripDtoSignal();
          if (currentTrip && trips?.find(t => t.id === currentTrip.id)) {
            targetCondition.target = this.getTargetByTrip(currentTrip);
          }
        }
        if (savedTargetCondition?.target?.selectedMode && targetCondition.target?.options?.map(x => x.mode).includes(savedTargetCondition.target.selectedMode)) {
          targetCondition.target.selectedMode = savedTargetCondition.target.selectedMode;
        }
      }
    }

    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }

  onAskAi(): void {
    const prompt = this.promptText.trim();
    if (!prompt) {
      return;
    }

    this.componentService.updateLoading(true);

    this.templateService.getAllFromAI(prompt).pipe(
      finalize(() => {
        this.componentService.updateLoading(false);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (items) => {
        this.aiItemsBase = this.mapAiItems(items || []);
        this.applyTargetIndex();
      }
    });
  }

  onAddTargetClick(): void {
    const target = this.target();
    if (!target) {
      throw new Error('Target is not set');
    }

    const entities = this.processedEntities() as AiTemplateEntity[];
    const items = this.mapEntitiesToAiItems(entities.filter(x => !x.isTargeted));

    if (!items.length) {
      return;
    }

    if (target.selectedMode === TargetMode.DicThings) {
      this.thingService.addFromAITemplate(items).pipe(
        tap(() => this.refreshTargetItems()),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
      return;
    }

    const targetId = target.id;
    if (!targetId) {
      throw new Error('Target Trip Id is not set');
    }

    const request = {
      tripId: targetId,
      things: items
    };

    const o = target.selectedMode === TargetMode.TripShared
      ? this.tripSharedService.addFromAITemplate(request)
      : this.tripThingService.addFromAITemplate(request);

    o.pipe(
      tap(() => this.refreshTargetItems()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  onDeleteTargetClick(): void {
    const target = this.target();
    if (!target) {
      throw new Error('Target is not set');
    }

    const entities = this.processedEntities() as AiTemplateEntity[];
    const deletable = entities.filter(x => x.isTargeted && x.targetId);

    if (!deletable.length) {
      return;
    }

    if (target.selectedMode === TargetMode.DicThings) {
      forkJoin(deletable.map(x => this.thingService.delete(x.targetId!))).pipe(
        tap(() => this.refreshTargetItems()),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
      return;
    }

    if (!target.id) {
      throw new Error('Target Trip Id is not set');
    }

    const deletes = deletable.map(x =>
      target.selectedMode === TargetMode.TripShared
        ? this.tripSharedService.delete(x.targetId!, target.id!)
        : this.tripThingService.delete(x.targetId!, target.id!)
    );

    forkJoin(deletes).pipe(
      tap(() => this.refreshTargetItems()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  targetEntityClick(entity: AiTemplateEntity) {
    const target = this.target();
    if (!target) {
      throw new Error('Target is not set');
    }

    if (entity.isTargeted) {
      this.deleteFromTarget(entity);
      return;
    }

    const items = this.mapEntitiesToAiItems([entity]);
    if (!items.length) {
      return;
    }

    if (target.selectedMode === TargetMode.DicThings) {
      this.thingService.addFromAITemplate(items).pipe(
        tap(() => this.refreshTargetItems()),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
      return;
    }

    if (!target.id) {
      throw new Error('Target Trip Id is not set');
    }

    const request = {
      tripId: target.id,
      things: items
    };

    const o = target.selectedMode === TargetMode.TripShared
      ? this.tripSharedService.addFromAITemplate(request)
      : this.tripThingService.addFromAITemplate(request);

    o.pipe(
      tap(() => this.refreshTargetItems()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private deleteFromTarget(entity: AiTemplateEntity): void {
    const target = this.target();
    if (!target || !entity.targetId) {
      return;
    }

    if (target.selectedMode === TargetMode.DicThings) {
      this.thingService.delete(entity.targetId).pipe(
        tap(() => this.refreshTargetItems()),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
      return;
    }

    if (!target.id) {
      return;
    }

    const o = target.selectedMode === TargetMode.TripShared
      ? this.tripSharedService.delete(entity.targetId, target.id)
      : this.tripThingService.delete(entity.targetId, target.id);

    o.pipe(
      tap(() => this.refreshTargetItems()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private mapAiItems(items: AIItemDto[]): AiTemplateEntity[] {
    return items.map((item, index) => ({
      id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${index}`),
      item_name: item.item_name,
      category: item.category,
      unit: item.unit,
      value: item.value,
      recommendations: item.recommendations,
      isTargeted: false,
      targetId: null
    }));
  }

  private mapEntitiesToAiItems(entities: AiTemplateEntity[]): AIItemDto[] {
    return entities.map(entity => ({
      category: entity.category,
      item_name: entity.item_name,
      unit: entity.unit,
      value: entity.value,
      recommendations: entity.recommendations
    }));
  }

  private loadTargetItems(target: Target | null): Observable<any[]> {
    if (!target) {
      return of([]);
    }

    if (target.selectedMode === TargetMode.DicThings) {
      return this.thingService.getAll() as Observable<any[]>;
    }

    if (!target.id) {
      return of([]);
    }

    if (target.selectedMode === TargetMode.TripShared) {
      return this.tripSharedService.getAll(target.id) as Observable<any[]>;
    }

    return this.tripThingService.getAll(target.id) as Observable<any[]>;
  }

  private buildTargetIndex(items: any[]): Map<string, string> {
    const index = new Map<string, string>();

    items.forEach(item => {
      const key = this.buildKey(
        item?.category,
        item?.name,
        item?.units,
        item?.value
      );
      if (!index.has(key) && item?.id) {
        index.set(key, item.id);
      }
    });

    return index;
  }

  private applyTargetIndex(): void {
    if (!this.aiItemsBase.length) {
      this.componentService.updateEntities([]);
      return;
    }

    const updated = this.aiItemsBase.map(item => {
      const key = this.buildKey(item.category, item.item_name, item.unit, item.value);
      const targetId = this.targetIndex.get(key) || null;
      return {
        ...item,
        isTargeted: !!targetId,
        targetId
      } as AiTemplateEntity;
    });

    this.componentService.updateEntities(updated);
  }

  private refreshTargetItems(): void {
    const target = this.target() ?? null;
    this.loadTargetItems(target).pipe(
      takeUntilDestroyed()
    ).subscribe((items) => {
      this.targetIndex = this.buildTargetIndex(items);
      this.applyTargetIndex();
    });
  }

  private buildKey(category?: string | null, name?: string | null, unit?: string | null, value?: number | null): string {
    const norm = (v: string | null | undefined) => (v ?? '').trim().toLowerCase();
    const val = value == null ? '' : Number(value).toString();
    return [norm(category), norm(name), norm(unit), val].join('|');
  }
}
