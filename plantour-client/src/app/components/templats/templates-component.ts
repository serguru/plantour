import { Component, DestroyRef, inject } from '@angular/core';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesHeader } from '../entities/entities-header-component/entities-header-component';
import { EntitiesComponent } from '../entities/entities-component';
import { TemplateItemComponent } from './template-item/template-item-component';
import { TripDto, TripService } from '../../services/trip-service';
import { AppService } from '../../services/app-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ComponentService } from '../../services/component-service';
import { TripSharedService } from '../../services/trip-shared-service';
import { TripThingService } from '../../services/trip-thing-service';
import { combineLatest, of, switchMap, tap } from 'rxjs';
import { TemplateService } from '../../services/template-service';
import { ThingService } from '../../services/thing-service';
import { UsersService } from '../../services/users-service';
import { Condition, Target, TargetCondition, TargetMode } from '../../services/dynamic-query-service';
import { ArrayOfGuidsRequest, MultipleIdsRequest } from '../../services/crud-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { CurrentTripService } from '../../services/current-trip-service';

// TODO: fix UI vertical scroll issues
@Component({
  selector: 'app-template-things-component',
  imports: [
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent
  ],
  templateUrl: './templates-component.html',
  styleUrl: './templates-component.scss',
})
export class TemplatesComponent {
  templateItemComponent = TemplateItemComponent;
  componentId: string = 'templates';
  appService = inject(AppService);
  tripService = inject(TripService);

  componentService = inject(ComponentService);
  templateService = inject(TemplateService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(ComponentService).dynamicQueryService;

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
      },
      {
        kind: 'target',
        label: 'Trip or dic things',
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
        property: 'activityName',
        label: 'Activity',
        icon: 'folder-open',
        filterText: '',
        comparisonType: 'exact',
      }, {
        kind: 'filter',
        property: 'templateName',
        label: 'Template',
        icon: 'folder-open',
        filterText: '',
        comparisonType: 'exact',
      }, {
        kind: 'filter',
        property: 'temperatureRangeName',
        label: 'Temperature Range',
        icon: 'folder-open',
        filterText: '',
        comparisonType: 'exact',
      }, {
        kind: 'filter',
        property: 'ageRangeName',
        label: 'Age',
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
        icon: 'box'
      }
    ];

  ngOnInit(): void {

    this.componentService.updateComponentId(this.componentId);
    var o = this.usersService.isAdminSignal() ? this.tripService.getAll() : this.tripService.getAllWhereParticipant();

    o.pipe(
      tap((trips: TripDto[]) => {
        this.initConditions(this.componentId, trips);
        this.initTargetLookup(trips);
        this.initSavedFeatures();
      }),
      switchMap(_ =>
        this.componentService.target$.pipe(
          switchMap((target: Target | null) => {
            if (target && target.selectedMode === TargetMode.DicThings) {
              return this.templateService.getAllForDic();
            }
            if (target && target.selectedMode === TargetMode.TripShared) {
              return this.templateService.getAllForSharedTrip(target.id!);
            }
            if (target && target?.id) {
              return this.templateService.getAllForTrip(target.id);
            }
            return this.templateService.getAll();
          }),
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(things =>
      this.componentService.updateEntities(things || [])
    );
  }

  initSavedFeatures() {
    const v = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    const id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    this.componentService.updateSelectedId(id);
  }

  initTargetLookup(trips: TripDto[] | null) {

    const dicTarget: Target = {
      id: "00000000-0000-0000-0000-000000000000", //  this is required by the p-select component
      name: "Things Dictionary",
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
          id: null,
          name: "Things Dictionary",
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

      this.thingService.addFromTemplate(request).pipe(
        switchMap(() => this.templateService.getAllForDic()),
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
      o = this.tripSharedService.addFromTemplate(request);
      m = this.templateService.getAllForSharedTrip(targetId);
    } else {
      o = this.tripThingService.addFromTemplate(request);
      m = this.templateService.getAllForTrip(targetId);
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

      this.thingService.deleteFromTemplate(request).pipe(
        switchMap(() => this.templateService.getAllForDic()),
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
      o = this.tripSharedService.deleteFromTemplate(request);
      m = this.templateService.getAllForSharedTrip(targetId);
    } else {
      o = this.tripThingService.deleteFromTemplate(request);
      m = this.templateService.getAllForTrip(targetId);
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
      const o = entity.isTargeted ? this.thingService.deleteFromTemplate(request) : this.thingService.addFromTemplate(request);
      const m = this.templateService.getAllForDic();

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
      o = entity.isTargeted ? this.tripSharedService.deleteFromTemplate(request) : this.tripSharedService.addFromTemplate(request);
      m = this.templateService.getAllForSharedTrip(target!.id!);

    } else {
      o = entity.isTargeted ? this.tripThingService.deleteFromTemplate(request) : this.tripThingService.addFromTemplate(request);
      m = this.templateService.getAllForTrip(target!.id!);
    }

    o.pipe(
      switchMap(() => m),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((things) => {
      this.componentService.updateEntities(things);
    });
  }
}
