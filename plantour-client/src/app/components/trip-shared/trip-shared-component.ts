import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CrudService, FromDicService, MultipleIdsRequest } from '../../services/crud-service';
import { TripSharedDto, CreateTripSharedRequest, UpdateTripSharedRequest, TripSharedService } from '../../services/trip-shared-service';
import { ActivatedRoute, Router } from '@angular/router';
import { TripSharedItemComponent } from './trip-shared-item/trip-shared-item-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader } from '../entities/entities-header-component/entities-header-component';
import { TripService } from '../../services/trip-service';
import { ComponentService } from '../../services/component-service';
import { switchMap, tap } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage-service';
import { Condition, DynamicQueryService, Target, TargetCondition, TargetMode } from '../../services/dynamic-query-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CurrentTripService } from '../../services/current-trip-service';
import { TripUserDto, TripUserService } from '../../services/trip-user-service';
import { findDuplicates, getFullName } from '../../helpers/utils';

@Component({
  selector: 'app-trip-shared',
  standalone: true,
  imports: [
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent
  ],
  templateUrl: './trip-shared-component.html',
  styleUrl: './trip-shared-component.scss'
})
export class TripSharedComponent implements OnInit {
  tripSharedItemComponent = TripSharedItemComponent;
  componentId: string = 'trip-shared';

  tripService = inject(TripService);
  componentService = inject(ComponentService);
  tripSharedService = inject(TripSharedService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(DynamicQueryService);

  targetCondition = toSignal(this.componentService.targetCondition$);
  target = toSignal(this.componentService.target$);

  targetedIds = toSignal(this.componentService.targetedIds$);
  notTargetedIds = toSignal(this.componentService.notTargetedIds$);

  currentTripService = inject(CurrentTripService);

  tripUserService = inject(TripUserService);

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
        label: 'Trip participant',
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

  itemMetaData: any = {
    assignOrUnassign: this.assignOrUnassign.bind(this)
  }


  ngOnInit(): void {

    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');

    // The checkTripIdGuard should ensure this never happens
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.tripUserService.getAll(this.tripId).pipe(
      tap((tripUsers: TripUserDto[]) => {
        const lookup = this.initTargetLookup(tripUsers);
        this.initConditions(this.componentId, tripUsers, lookup);
        this.initSavedFeatures();
      }),
      switchMap(_ =>
        this.componentService.target$.pipe(
          switchMap((target: Target | null) => {
            if (target && target.id) {
              return this.tripSharedService.getAllForAssignee(this.tripId!, target.id);
            }
            return this.tripSharedService.getAll(this.tripId!);
          }),
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(tripShareds =>
      this.componentService.updateEntities(tripShareds || [])
    );
  }

  initSavedFeatures() {
    const v = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    const id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    this.componentService.updateSelectedId(id);
  }


  initTargetLookup(users: TripUserDto[] | null): any[] {

    if (!users) {
      this.componentService.updateTargetLookup([]);
      return [];
    }

    const duplicatedIds = findDuplicates(users);
    const lookup: { id: string; name: string }[] = [];

    users.forEach((x: TripUserDto) => {
      const isDuplicated = duplicatedIds.some(y => y === x.id);
      const name = getFullName(x.firstName ?? null, x.lastName ?? null, x.email, isDuplicated);
      lookup.push({
        id: x.id,
        name: name
      });
    });
    lookup.sort((a, b) => a.name.localeCompare(b.name));

    this.componentService.updateTargetLookup(lookup);
    this.itemMetaData.packs = lookup;
    return lookup;
  }

  initConditions(componentId: string | null, tripUsers: TripUserDto[] | null = null, lookup: any[] = []): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }
    const savedConditions = this.localStorageService.getComponentKeyObject(componentId, 'conditions') || [];
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);
    const targetCondition: TargetCondition | undefined = initialConditions.find(c => c.kind === 'target');

    if (targetCondition) {

      const targetTripUserId = targetCondition.target?.id;
      
      if (targetTripUserId) {
        const tripUser = tripUsers?.find(p => p.id === targetTripUserId);
        if (tripUser) {
          targetCondition.target = {
            id: tripUser.id,
            name: lookup.find(l => l.id === tripUser.id)?.name || 'No User Name'
            // selectedMode: TargetMode.TripShared,
            // options: [{
            //   label: 'TripShared',
            //   mode: TargetMode.TripShared
            // }],
            // hideOptions: true
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
      throw new Error('Target User Id is not set');
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

    this.tripSharedService.assign(request).pipe(
      switchMap(() => this.tripSharedService.getAllForAssignee(this.tripId!, targetId)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripSharedThings) => {
      this.componentService.updateEntities(tripSharedThings);
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
    this.tripSharedService.unassign(request).pipe(
      switchMap(() => this.tripSharedService.getAllForAssignee(this.tripId!, targetId)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripSharedThings) => {
      this.componentService.updateEntities(tripSharedThings);
    });
  }

  deleteTripThing(id: string): void {
    this.tripSharedService.delete(id, this.tripId!).pipe(

      switchMap(x => {
        return this.componentService.target$.pipe(
          switchMap(target => {
            const packageId = target?.id;
            if (packageId) {
              return this.tripSharedService.getAllForAssignee(this.tripId!, packageId);
            }
            return this.tripSharedService.getAll(this.tripId!);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripSharedThings) => {
      this.componentService.updateEntities(tripSharedThings);
    });
  }

  assignOrUnassign(entity: any, assigneeId: string | null, reassignAllowed: boolean): void {
    const request: MultipleIdsRequest = {
      collectionId: this.tripId!,
      ids: [entity.id],
      id: assigneeId!
    };

    const assign: boolean = reassignAllowed ? !!assigneeId : !entity.isTargeted;
    const o = assign ? this.tripSharedService.assign(request) : this.tripSharedService.unassign(request);

    o.pipe(
      switchMap(() => this.target()?.id ? this.tripSharedService.getAllForAssignee(this.tripId!, this.target()!.id!) : this.tripSharedService.getAll(this.tripId!)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripSharedThings) => {
      this.componentService.updateEntities(tripSharedThings);
    });
  }

  targetEntityButtonClick(entity: any): void {
    const target = this.target();
    this.assignOrUnassign(entity, target?.id || null, false);
  }
}