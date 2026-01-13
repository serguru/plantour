import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CrudService, FromDicService, MultipleIdsRequest, PackingService } from '../../services/crud-service';
import { TripThingDto, CreateTripThingRequest, UpdateTripThingRequest, TripThingService } from '../../services/trip-thing-service';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseListComponent } from '../base-list/base-list';
import { TripPackageDto, TripPackageService } from '../../services/trip-package-service';
import { Select } from "primeng/select";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UpperActionType } from '../../helpers/enums';
import { TripThingItemComponent } from './trip-thing-item/trip-thing-item-component';
import { AppService } from '../../services/app-service';
import { MessagesService } from '../../services/messages-service';
import { CurrentTripService } from '../../services/current-trip-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeaderComponent } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { Condition, DynamicQueryService, Target, TargetCondition, TargetMode } from '../../services/dynamic-query-service';
import { TripDto, TripService } from '../../services/trip-service';
import { switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-trip-things',
  standalone: true,
  imports: [
    EntitiesComponent,
    EntitiesHeaderComponent,
    EntitiesActionsComponent
  ],
  templateUrl: './trip-things-component.html',
  styleUrl: './trip-things-component.scss',
})
export class TripThingsComponent implements OnInit {
  tripThingItemComponent = TripThingItemComponent;
  componentId = 'trip-things';

  tripService = inject(TripService);
  componentService = inject(ComponentService);
  tripThingService = inject(TripThingService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(DynamicQueryService);
  tripPackageService = inject(TripPackageService);

  targetCondition = toSignal(this.componentService.targetCondition$);
  target = toSignal(this.componentService.target$);

  targetedIds = toSignal(this.componentService.targetedIds$);
  notTargetedIds = toSignal(this.componentService.notTargetedIds$);

  currentTripService = inject(CurrentTripService);
  //currentTripDtoSignal = toSignal(this.currentTripService.currentTripDto$, { initialValue: null });
  private route = inject(ActivatedRoute);

  private destroyRef = inject(DestroyRef);

  private tripId: string | null = null;

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
        label: 'Trip pack',
        icon: 'box',
        target: null
      },
      {
        kind: 'filter',
        property: 'name',
        label: 'Filter by Name',
        filterText: '',
        comparisonType: 'contains',
        icon: 'filter'
      }
    ];

  ngOnInit(): void {

    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');

    // The checkTripIdGuard should ensure this never happens
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.tripPackageService.getAll(this.tripId).pipe(
      tap((packs: TripPackageDto[]) => {
        this.initConditions(this.componentId, packs);
        this.initTargetLookup(packs);
        this.initSavedFeatures();
      }),
      switchMap(_ =>
        this.componentService.target$.pipe(
          switchMap((target: Target | null) => {
            if (target && target.id) {
              return this.tripThingService.getAllForPackage(this.tripId!, target.id);
            }
            return this.tripThingService.getAll(this.tripId!);
          }),
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(tripThings =>
      this.componentService.updateEntities(tripThings || [])
    );
  }

  initSavedFeatures() {
    const v = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    const id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    this.componentService.updateSelectedId(id);
  }

  initTargetLookup(packs: TripPackageDto[] | null) {

    if (!packs) {
      this.componentService.updateTargetLookup([]);
      return;
    }

    const lookup = (packs).sort((a, b) => a.name.localeCompare(b.name)).map((t: any) => ({
      id: t.id,
      name: t.name
    }));

    this.componentService.updateTargetLookup(lookup);
  }

  initConditions(componentId: string | null, packs: TripPackageDto[] | null = null): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }
    const savedConditions = this.localStorageService.getComponentKeyObject(componentId, 'conditions') || [];
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);
    const targetCondition: TargetCondition | undefined = initialConditions.find(c => c.kind === 'target');

    if (targetCondition) {

      const targetPackId = targetCondition.target?.id;
      // Ensure the target pack id is found in the packs list
      if (targetPackId) {
        const pack = packs?.find(p => p.id === targetPackId);
        if (pack) {
          targetCondition.target = {
            id: pack.id, 
            name: pack.name, 
            selectedMode: TargetMode.Packing, 
            options: [{
              label: 'Packing',
              mode: TargetMode.Packing
            }],
            hideOptions: true
          };
        }
      } else {
        targetCondition.target = null;
      }
    }

    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }

  onAddTargetClick(): void {
    const targetId = this.target()?.id;

    if (!targetId) {
      throw new Error('Target Package Id is not set');
    }
    const ids = this.notTargetedIds();
    if (!ids || ids.length === 0) {
      throw new Error('No not targeted ids available');
    }
    const request: MultipleIdsRequest = {
      collectionId: this.tripId!,
      ids: ids,
      id: targetId
    };
    this.tripThingService.pack(request).pipe(
      switchMap(() => this.tripThingService.getAllForPackage(this.tripId!, targetId)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripThings) => {
      this.componentService.updateEntities(tripThings);
    });
  }

  onDeleteTargetClick(): void {
    const targetId = this.target()?.id;

    if (!targetId) {
      throw new Error('Target Id is not set');
    }
    const ids = this.targetedIds();
    if (!ids || ids.length === 0) {
      throw new Error('No targeted ids available');
    }
    const request: MultipleIdsRequest = {
      collectionId: this.tripId!,
      ids: ids,
      id: targetId
    };
    this.tripThingService.unpack(request).pipe(
      switchMap(() => this.tripThingService.getAllForPackage(this.tripId!, targetId)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripThings) => {
      this.componentService.updateEntities(tripThings);
    });
  }

  deleteTripThing(id: string): void {
    this.tripThingService.delete(id, this.tripId!).pipe(

      switchMap(x => {
        return this.componentService.target$.pipe(
          switchMap(target => {
            const packageId = target?.id;
            if (packageId) {
              return this.tripThingService.getAllForPackage(this.tripId!, packageId);
            }
            return this.tripThingService.getAll(this.tripId!);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripThings) => {
      this.componentService.updateEntities(tripThings);
    });
  }

  targetEntityButtonClick(entity: any) {
    const target = this.target();

    const request: MultipleIdsRequest = {
      collectionId: this.tripId!,
      ids: [entity.id],
      id: target!.id!
    };

    const o = entity.isTargeted ? this.tripThingService.unpack(request) : this.tripThingService.pack(request);

    o.pipe(
      switchMap(() => this.tripThingService.getAllForPackage(this.tripId!, target!.id!)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripThings) => {
      this.componentService.updateEntities(tripThings);
    });
  }
}