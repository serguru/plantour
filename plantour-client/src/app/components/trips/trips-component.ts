import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TripDto, TripService } from '../../services/trip-service';
import { TripItemComponent } from './trip-item/trip-item-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { TripThingService } from '../../services/trip-thing-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Condition, TargetCondition } from '../../services/dynamic-query-service';
import { UsersService } from '../../services/users-service';
import { concatMap, distinctUntilChanged, filter, switchMap, tap, withLatestFrom } from 'rxjs';
import { CurrentTripService } from '../../services/current-trip-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { DocumentsService } from '../../services/documents-service';


// TODO: Add a method to create a new trip from the existing one 
// TODO: Find out why it sends two request per a list trip click
// TODO: make a trip and its data read only if completed
@Component({
  selector: 'app-trips-component',
  imports: [
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent
  ],
  standalone: true,
  templateUrl: './trips-component.html',
  styleUrl: './trips-component.scss',
})
export class TripsComponent implements OnInit {
  tripItemComponent = TripItemComponent;
  componentId: string = 'trips';

  documentsService = inject(DocumentsService);
  router = inject(Router);

  tripService = inject(TripService);

  componentService = inject(ComponentService);

  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(ComponentService).dynamicQueryService;

  currentTripService = inject(CurrentTripService);
  tripSelected = toSignal(this.currentTripService.currentTripDto$);

  usersService = inject(UsersService);

  isReadOnly = this.usersService.isParticipantSignal;

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
        kind: 'filter',
        property: 'name',
        label: 'Filter by Name',
        filterText: '',
        comparisonType: 'contains',
        icon: 'shopping-bag'
      },
      {
        kind: 'filter',
        property: 'tripStatus',
        label: 'Trip Status',
        filterText: '',
        comparisonType: 'exact',
        icon: 'flag'
      }
    ];

  lowerTextVisible = signal<boolean>(true);

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
        label: 'Download Trip PDF',
        icon: 'document',
        disabledIfNoSelection: true,
        action: () => {

          const tripId = this.tripSelected()?.id;
          if (!tripId) {
            throw new Error('No trip selected');
          }
          this.documentsService.getTripReportPdf(tripId).subscribe(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `trip-report-${tripId}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
          });
        }
      },
      {
        label: 'Help',
        icon: 'question-circle',
        action: () => {
          this.router.navigate(['/help/trips/trips-intro']);
        }
      }
    ];
  }
  );

  itemMetaData: any = {
    lowerTextVisible: this.lowerTextVisible,
  }



  ngOnInit(): void {

    this.componentService.updateComponentId(this.componentId);

    var o = this.usersService.isAdminSignal() ? this.tripService.getAll() : this.tripService.getAllWhereParticipant();

    o.pipe(
      tap((trips: TripDto[]) => {
        this.initConditions(this.componentId, trips);
        this.initSavedFeatures(trips);
        this.componentService.updateEntities(trips || [])
      }),
      concatMap(trips =>
        this.componentService.selectedId$.pipe(
          withLatestFrom(
            this.componentService.componentId$,
          ),
          filter(([id, componentId]) => componentId === this.componentId),
          distinctUntilChanged(),
          tap(([id, componentId]) => {
            if (!id || !trips || trips.length === 0) {
              this.currentTripService.updateCurrentTripId(null);
              return;
            }
            const selected = trips.find(e => e.id === id) || null;
            this.currentTripService.updateCurrentTripId(selected ? selected.id : null);
          }),
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  initSavedFeatures(trips: TripDto[] | null = null): void {
    const v = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    let id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');

    if (id && trips?.some(t => t.id === id)) {
      this.componentService.updateSelectedId(id);
    } else {
      this.componentService.updateSelectedId(null);
    }

  }

  initConditions(componentId: string | null, trips: TripDto[] | null = null): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }
    const savedConditions = this.localStorageService.getComponentKeyObject(componentId, 'conditions') || [];
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);

    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);

    const lowerTextVisible: boolean = this.localStorageService.getComponentKey(this.componentId, 'lowerTextVisible');
    this.lowerTextVisible.set(lowerTextVisible);

  }

  deleteTrip(id: string): void {
    this.tripService.delete(id).pipe(
      switchMap(x => {
        return this.usersService.isAdminSignal() ? this.tripService.getAll() : this.tripService.getAllWhereParticipant();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(trips => {
      this.componentService.updateEntities(trips);
    });
  }
}