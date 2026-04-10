import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { TripPackageDto, TripPackageService } from '../../services/trip-package-service';
import { ActivatedRoute, Router } from '@angular/router';
import { TripPackItemComponent } from './trip-pack-item/trip-pack-item-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { Condition, DynamicQueryService } from '../../services/dynamic-query-service';
import { CurrentTripService } from '../../services/current-trip-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { DocumentsService } from '../../services/documents-service';
import { UsersService } from '../../services/users-service';


@Component({
  selector: 'app-trip-packs',
  standalone: true,
  imports: [
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent
  ],
  templateUrl: './trip-packs-component.html',
  styleUrl: './trip-packs-component.scss',
})
export class TripPacksComponent implements OnInit {
  tripPackItemComponent = TripPackItemComponent;
  componentId: string = 'trip-packs';
  componentService = inject(ComponentService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(DynamicQueryService);
  tripPackageService = inject(TripPackageService);
  currentTripService = inject(CurrentTripService);
  documentsService = inject(DocumentsService);
  usersService = inject(UsersService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private tripId: string | null = null;
  lowerTextVisible = signal<boolean>(true);

  selectedId = toSignal(this.componentService.selectedId$, { initialValue: null });

  itemMetaData: { lowerTextVisible: () => boolean } = {
    lowerTextVisible: this.lowerTextVisible,
  };


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
        icon: 'filter'
      }
    ];


  menuItems = computed<MenuConfig[]>(() => {
    return [
      {
        label: `${this.lowerTextVisible() ? 'Hide' : 'Show'} Lower Text`,
        icon: 'check',
        action: () => {
          this.lowerTextVisible.set(!this.lowerTextVisible());
          this.localStorageService.setComponentKey(this.componentId, 'lowerTextVisible', this.lowerTextVisible());
        }
      },
      {
        label: 'Download Packing List PDF',
        icon: 'document',
        disabledIfNoSelection: true,
        action: () => {

          const tripId = this.tripId;
          if (!tripId) {
            throw new Error('No trip selected');
          }

          this.documentsService.getPackingListPdf(tripId, this.selectedId()!).subscribe(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `trip-packing-list-${tripId}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
          });
        }
      }
    ];
  }
  );




  initConditions(componentId: string | null): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }
    const savedConditions = this.localStorageService.getComponentKeyObject(componentId, 'conditions') || [];
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);
    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }


  ngOnInit(): void {

    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');

    // The checkTripIdGuard should ensure this never happens
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.initConditions(this.componentId);


    this.tripPackageService.getAll(this.tripId!).pipe(
      tap((p: TripPackageDto[]) => {
        this.initSavedFeatures(p);
      }),

      takeUntilDestroyed(this.destroyRef)
    ).subscribe(tripPacks =>
      this.componentService.updateEntities(tripPacks || [])
    );
  }

  initSavedFeatures(items: TripPackageDto[]) {
    const v = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    let id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    if(!items || !items.find(x => x.id === id)) {
      id = null;
    }
    this.componentService.updateSelectedId(id);

    const lowerTextVisible = this.localStorageService.getComponentBooleanKey(this.componentId, 'lowerTextVisible', true);
    this.lowerTextVisible.set(lowerTextVisible);
  }


  deleteTripPack(id: string): void {
    this.tripPackageService.delete(id, this.tripId!).pipe(
      switchMap(_ => 
        this.tripPackageService.getAll(this.tripId!)
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripPacks) => {
      this.componentService.updateEntities(tripPacks);
    });
  }
}