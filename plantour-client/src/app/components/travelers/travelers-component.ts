import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { CrudService, FromDicService, MultipleIdsRequest } from '../../services/crud-service';
import { AdminsParticipantDto, UpdateAdminsParticipantRequest, AdminsParticipantService } from '../../services/admins-participant-service';
import { CreateTripUserRequest, TripUserDto, TripUserService, UpdateTripUserRequest } from '../../services/trip-user-service';
import { TravelerItemComponent } from './traveler-item/traveler-item-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader } from '../entities/entities-header-component/entities-header-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { AppService } from '../../services/app-service';
import { TripDto, TripService } from '../../services/trip-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ComponentService } from '../../services/component-service';
import { catchError, finalize, switchMap, tap, throwError } from 'rxjs';
import { Condition, Target, TargetCondition, TargetMode } from '../../services/dynamic-query-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { CurrentTripService } from '../../services/current-trip-service';
import { UsersService } from '../../services/users-service';

@Component({
  selector: 'app-travelers-component',
  standalone: true,
  imports: [
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent
  ],
  templateUrl: './travelers-component.html',
  styleUrl: './travelers-component.scss',
})
export class TravelersComponent implements OnInit {
  travelerItemComponent = TravelerItemComponent;
  componentId: string = 'travelers';

  deleteMessage = 'You are deleting a traveler. They will be removed not only from your traveler list, but from all your trips. This data cannot be restored. Continue?';

  appService = inject(AppService);
  tripService = inject(TripService);

  componentService = inject(ComponentService);
  adminsParticipantService = inject(AdminsParticipantService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(ComponentService).dynamicQueryService;
  tripUserService = inject(TripUserService);
  usersService = inject(UsersService);

  isReadOnly = computed(() => this.usersService.isParticipantSignal());

  targetCondition = toSignal(this.componentService.targetCondition$);
  target = toSignal(this.componentService.target$);


  targetedIds = toSignal(this.componentService.targetedIds$);
  notTargetedIds = toSignal(this.componentService.notTargetedIds$);

  currentTripService = inject(CurrentTripService);
  currentTripDtoSignal = toSignal(this.currentTripService.currentTripDto$, { initialValue: null });

  private destroyRef = inject(DestroyRef);

  conditions: Condition[] =
    [
      {
        kind: 'sort',
        label: 'Sort by Name',
        icon: 'sort-alt',
        property: 'fullName',
        sortType: 'text',
        direction: 'none'
      },
      {
        kind: 'filter',
        property: 'fullName',
        label: 'Filter by Name',
        filterText: '',
        comparisonType: 'contains',
        icon: 'user'
      }
    ];

  ngOnInit(): void {

    this.componentService.updateComponentId(this.componentId);

    this.componentService.updateLoading(true);

    this.tripService.getAll().pipe(
      tap((trips: TripDto[]) => {
        this.initConditions(this.componentId, trips);
        this.initTargetLookup(trips);
        this.initSavedFeatures();
      }),
      switchMap((_: TripDto[]) =>
        this.componentService.target$.pipe(
          switchMap((target: Target | null) => {
            if (target && target.id) {
              return this.adminsParticipantService.getAllForTrip(target.id);
            }
            return this.adminsParticipantService.getAll();
          }),
        )
      ),
      tap(() => this.componentService.updateLoading(false)),
      catchError(err => {
        this.componentService.updateLoading(false)
        return throwError(() => err);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((packages: AdminsParticipantDto[]) =>
      this.componentService.updateEntities(packages || [])
    );
  }

  initSavedFeatures() {
    const v = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    const id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    this.componentService.updateSelectedId(id);
  }

  initTargetLookup(trips: TripDto[] | null) {

    if (!trips || this.usersService.isParticipantSignal()) {
      this.componentService.updateTargetLookup([]);
      return;
    }

    const lookup = (trips).sort((a, b) => {
      const aDate = a.startDate ?? '';
      const bDate = b.startDate ?? '';
      return aDate.localeCompare(bDate);
    }).map((t: any) => ({
      id: t.id,
      name: t.name
    }));

    this.componentService.updateTargetLookup(lookup);
  }

  initConditions(componentId: string | null, trips: TripDto[] | null = null): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }
    const savedConditions = this.localStorageService.getComponentKeyObject(componentId, 'conditions') || [];

    const isParticipant = this.usersService.isParticipantSignal();

    if (!isParticipant) {
      this.conditions.push({
          kind: 'target',
          label: 'Trip users',
          icon: 'compass',
          target: null
        },
      );
    }

    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);

    if (!isParticipant) {
      const targetCondition: TargetCondition | undefined = initialConditions.find(c => c.kind === 'target');

      if (targetCondition) {
        const trip = trips?.find(t => t.id === targetCondition.target?.id);
        if (!trip) {
          const trip = this.currentTripDtoSignal();
          if (trip && trips?.find(t => t.id === trip.id)) {
            targetCondition.target = {
              id: trip.id, name: trip.name, selectedMode: TargetMode.TripThings, options: [{
                label: 'Trip Things',
                mode: TargetMode.TripThings
              }]
            };
          }
        }
      }
    } else {
      // remove target condition for participants
      const index = initialConditions.findIndex(c => c.kind === 'target');
      if (index !== -1) {
        initialConditions.splice(index, 1);
      }
    }

    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }

  onAddTargetClick(): void {
    const targetId = this.target()?.id;

    if (!targetId) {
      throw new Error('Target Trip Id is not set');
    }
    const ids = this.notTargetedIds();
    if (!ids || ids.length === 0) {
      throw new Error('No not targeted ids available');
    }
    const request: MultipleIdsRequest = {
      collectionId: targetId,
      ids: ids
    };
    this.tripUserService.addFromDic(request).pipe(
      switchMap(() => this.adminsParticipantService.getAllForTrip(targetId)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(travelers => {
      this.componentService.updateEntities(travelers);
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
      collectionId: targetId,
      ids: ids
    };
    this.tripUserService.deleteFromDic(request).pipe(
      switchMap(() => this.adminsParticipantService.getAllForTrip(targetId)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(travelers => {
      this.componentService.updateEntities(travelers);
    });
  }

  deleteTraveler(id: string): void {
    this.adminsParticipantService.delete(id).pipe(

      switchMap(x => {
        return this.componentService.target$.pipe(
          switchMap(target => {
            const tripId = target?.id;
            if (tripId) {
              return this.adminsParticipantService.getAllForTrip(tripId);
            }
            return this.adminsParticipantService.getAll();
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(travelers => {
      this.componentService.updateEntities(travelers);
    });
  }

  targetEntityButtonClick(entity: any) {
    const target = this.target();

    const request: MultipleIdsRequest = {
      collectionId: target!.id!,
      ids: [entity.id]
    };

    const o = entity.isTargeted ? this.tripUserService.deleteFromDic(request) : this.tripUserService.addFromDic(request);

    o.pipe(
      switchMap(() => this.adminsParticipantService.getAllForTrip(target!.id!)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(travelers => {
      this.componentService.updateEntities(travelers);
    });
  }
}