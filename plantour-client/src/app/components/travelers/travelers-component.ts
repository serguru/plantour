import { Component, DestroyRef, inject } from '@angular/core';
import { CrudService, FromDicService, MultipleIdsRequest } from '../../services/crud-service';
import { AdminsParticipantDto, UpdateAdminsParticipantRequest, AdminsParticipantService } from '../../services/admins-participant-service';
import { BaseListComponent } from '../base-list/base-list';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { SignUpParticipantRequest } from '../../models/auth.models';
import { CreateTripUserRequest, TripUserDto, TripUserService, UpdateTripUserRequest } from '../../services/trip-user-service';
import { UpperActionType } from '../../helpers/enums';
import { TravelerItemComponent } from './traveler-item/traveler-item-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeaderComponent } from '../entities/entities-header-component/entities-header-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { AppService } from '../../services/app-service';
import { TripDto, TripService } from '../../services/trip-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ComponentService } from '../../services/component-service';
import { switchMap, tap } from 'rxjs';
import { Condition } from '../../services/dynamic-query-service';

// TODO: make readonly for participants
@Component({
  selector: 'app-travelers-component',
  standalone: true,
  imports: [
    // EntitiesComponent,
    // EntitiesHeaderComponent,
    // EntitiesActionsComponent
  ],
  templateUrl: './travelers-component.html',
  styleUrl: './travelers-component.scss',
})
export class TravelersComponent {
  // travelerItemComponent = TravelerItemComponent;
  // componentId: string = 'travelers';

  // appService = inject(AppService);
  // tripService = inject(TripService);

  // // This does not work
  // trips = toSignal(this.tripService.getAllWhereParticipant(), { initialValue: null });

  // componentService = inject(ComponentService);
  // adminsParticipantService = inject(AdminsParticipantService);
  // settingsPersistenceService = inject(ComponentService).settingsPersistenceService;
  // dynamicQueryService = inject(ComponentService).dynamicQueryService;
  // tripUserService = inject(TripUserService);

  // targetId = toSignal(this.componentService.targetCondition$);
  // targetedIds = toSignal(this.componentService.targetedIds$);
  // notTargetedIds = toSignal(this.componentService.notTargetedIds$);
  // tripSelected = toSignal(this.appService.tripSelected$);
  // private destroyRef = inject(DestroyRef);

  // constructor() {
  // }

  // ngOnInit(): void {
  //   this.componentService.targetCondition$.pipe(
  //     switchMap(tripId => {
  //       if (tripId) {
  //         return this.adminsParticipantService.getAllForTrip(tripId);
  //       }
  //       return this.adminsParticipantService.getAll();
  //     }
  //     ),
  //     takeUntilDestroyed(this.destroyRef)
  //   ).subscribe(travelers =>
  //     this.componentService.updateEntities(travelers || [])
  //   );

  //   this.tripService.getAll().pipe(
  //     tap((trips: TripDto[]) => {
  //       this.initState(this.componentId, trips);
  //       this.initTargetLookup(trips);
  //     }),
  //     takeUntilDestroyed(this.destroyRef)
  //   ).subscribe();
  // }

  // initTargetLookup(trips: TripDto[] | null) {

  //   if (!trips) {
  //     this.componentService.updateTargetLookup([]);
  //     return;
  //   }

  //   const lookup = (trips).sort((a, b) => {
  //     const aDate = a.startDate ?? '';
  //     const bDate = b.startDate ?? '';
  //     return aDate.localeCompare(bDate);
  //   }).map((t: any) => ({ id: t.id, name: t.name }));

  //   this.componentService.updateTargetLookup(lookup);
  // }

  // initState(componentId: string | null, trips: TripDto[] | null = null): void {
  //   if (!componentId) {
  //     return;
  //   }
  //   const savedConditions = this.settingsPersistenceService.getComponentKey(componentId, 'conditions');
  //   const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);

  //   const targetCondition: any = initialConditions.find(c => c.kind === 'filter' && c.comparisonType == 'exact' && c.property === 'target');

  //   if (targetCondition && targetCondition.filterText) {
  //     const trip = trips?.find(t => t.id === targetCondition.filterText);
  //     if (!trip) {
  //       targetCondition.filterText = '';
  //     }
  //   }

  //   if (!targetCondition.filterText) {
  //     const tripId = this.appService.tripSelectedValue()?.id;
  //     if (tripId && trips?.find(t => t.id === tripId)) {
  //       targetCondition.filterText = tripId;
  //     }
  //   }

  //   this.componentService.updateComponentInit(
  //     {
  //       componentId: componentId,
  //       initialConditions: initialConditions
  //     }
  //   );

  // }

  // onAddTargetClick(): void {
  //   const targetId = this.targetId();
  //   if (!targetId) {
  //     throw new Error('Target Trip Id is not set');
  //   }
  //   const ids = this.notTargetedIds();
  //   if (!ids || ids.length === 0) {
  //     throw new Error('No not targeted ids available');
  //   }
  //   const request: MultipleIdsRequest = {
  //     collectionId: targetId,
  //     ids: ids
  //   };
  //   this.tripUserService.addFromDic(request).pipe(
  //     switchMap(() => this.adminsParticipantService.getAllForTrip(targetId)),
  //     takeUntilDestroyed(this.destroyRef)
  //   ).subscribe((travelers) => {
  //     this.componentService.updateEntities(travelers);
  //   });
  // }

  // onDeleteTargetClick(): void {
  //   const targetId = this.targetId();
  //   if (!targetId) {
  //     throw new Error('Target Id is not set');
  //   }
  //   const ids = this.targetedIds();
  //   if (!ids || ids.length === 0) {
  //     throw new Error('No targeted ids available');
  //   }
  //   const request: MultipleIdsRequest = {
  //     collectionId: targetId,
  //     ids: ids
  //   };
  //   this.tripUserService.deleteFromDic(request).pipe(
  //     switchMap(() => this.adminsParticipantService.getAllForTrip(targetId)),
  //     takeUntilDestroyed(this.destroyRef)
  //   ).subscribe((travelers) => {
  //     this.componentService.updateEntities(travelers);
  //   });
  // }

  // conditions: Condition[] =
  //   [
  //     {
  //       kind: 'sort',
  //       property: 'email',
  //       sortType: 'text',
  //       direction: 'none'
  //     },
  //     {
  //       kind: 'filter',
  //       property: 'target',
  //       label: 'Trip',
  //       filterText: '',
  //       comparisonType: 'exact',
  //       icon: 'compass'
  //     },
  //     {
  //       kind: 'filter',
  //       property: 'email',
  //       label: 'Email',
  //       filterText: '',
  //       comparisonType: 'contains'
  //     }
  //   ];

  // delete(id: string): void {
  //   this.adminsParticipantService.delete(id).pipe(

  //     switchMap(x => {
  //       return this.componentService.targetCondition$.pipe(
  //         switchMap(tripId => {
  //           if (tripId) {
  //             return this.adminsParticipantService.getAllForTrip(tripId);
  //           }
  //           return this.adminsParticipantService.getAll();
  //         })
  //       );
  //     }),
  //     takeUntilDestroyed(this.destroyRef)
  //   ).subscribe((travelers) => {
  //     this.componentService.updateEntities(travelers);
  //   });
  // }

  // targetEntityClick(tripId: string, entity: any) {
  //   const request: MultipleIdsRequest = {
  //     collectionId: tripId,
  //     ids: [entity.id]
  //   };

  //   const o = entity.isTargeted ? this.tripUserService.deleteFromDic(request) : this.tripUserService.addFromDic(request);

  //   o.pipe(
  //     switchMap(() => this.adminsParticipantService.getAllForTrip(tripId)),
  //     takeUntilDestroyed(this.destroyRef)
  //   ).subscribe((travelers) => {
  //     this.componentService.updateEntities(travelers);
  //   });
  // }
}