import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, switchMap, tap } from 'rxjs';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { ExpensesOverviewComponent } from '../expenses-overview/expenses-overview-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { UsersService } from '../../services/users-service';
import { Condition, DynamicQueryService } from '../../services/dynamic-query-service';
import { DocumentsService } from '../../services/documents-service';
import { TripSharedExpenseDto, TripSharedExpenseService } from '../../services/trip-shared-expense-service';
import { TripService } from '../../services/trip-service';
import { TripUserDto, TripUserService } from '../../services/trip-user-service';
import { TripSharedExpenseItemComponent } from './trip-shared-expense-item/trip-shared-expense-item-component';

@Component({
  selector: 'app-trip-shared-expenses',
  standalone: true,
  imports: [
    EntitiesActionsComponent,
    ExpensesOverviewComponent,
    EntitiesComponent,
    EntitiesHeader,
  ],
  templateUrl: './trip-shared-expenses-component.html',
  styleUrl: './trip-shared-expenses-component.scss',
})
export class TripSharedExpensesComponent implements OnInit {
  tripSharedExpenseItemComponent = TripSharedExpenseItemComponent;
  componentId = 'trip-shared-expenses';

  componentService = inject(ComponentService);
  tripSharedExpenseService = inject(TripSharedExpenseService);
  documentsService = inject(DocumentsService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(DynamicQueryService);
  tripService = inject(TripService);
  tripUserService = inject(TripUserService);
  usersService = inject(UsersService);

  isParticipant = this.usersService.isParticipantSignal;
  lowerTextVisible = signal<boolean>(true);

  itemMetaData: { tripCurrencyAbbreviation: string | null; lowerTextVisible: () => boolean } = {
    tripCurrencyAbbreviation: null,
    lowerTextVisible: this.lowerTextVisible,
  };
  tripSharedExpenses = signal<TripSharedExpenseDto[] | null>(null);
  tripUsers = signal<TripUserDto[] | null>(null);
  overviewLoaded = signal(false);

  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private tripId: string | null = null;

  menuItems = computed<MenuConfig[]>(() => {
    return [
      {
        label: `${this.lowerTextVisible() ? 'Hide' : 'Show'} Lower Text`,
        icon: 'check',
        action: () => {
          this.lowerTextVisible.set(!this.lowerTextVisible());
          this.localStorageService.setComponentKey(this.componentId, 'lowerTextVisible', this.lowerTextVisible());
        },
      },
      {
        label: 'Download Expenses PDF',
        icon: 'document',
        action: () => this.downloadExpensesPdf(),
      },
    ];
  });

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
      kind: 'filter',
      property: 'name',
      label: 'Filter by Name',
      filterText: '',
      comparisonType: 'contains',
      icon: 'filter',
    },
    {
      kind: 'filter',
      property: 'category',
      label: 'Category',
      filterText: '',
      comparisonType: 'exact',
      icon: 'filter',
    },
  ];

  ngOnInit(): void {
    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.initConditions(this.componentId);

    combineLatest([
      this.tripSharedExpenseService.getAll(this.tripId),
      this.tripService.getById(this.tripId),
      this.tripUserService.getAll(this.tripId),
    ]).pipe(
      tap(([expenses, trip, participants]) => {
        this.itemMetaData.tripCurrencyAbbreviation = trip.currency;
        this.tripSharedExpenses.set(expenses);
        this.tripUsers.set(participants);
        this.overviewLoaded.set(true);
        this.initSavedFeatures(expenses);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(([expenses]) => this.componentService.updateEntities(expenses || []));
  }

  initSavedFeatures(items: TripSharedExpenseDto[]) {
    const actionsVisible = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(actionsVisible);

    let id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    if (!items || !items.find(x => x.id === id)) {
      id = null;
    }
    this.componentService.updateSelectedId(id);

    const lowerTextVisible = this.localStorageService.getComponentBooleanKey(this.componentId, 'lowerTextVisible', true);
    this.lowerTextVisible.set(lowerTextVisible);
  }

  initConditions(componentId: string | null): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }
    const savedConditions = this.localStorageService.getComponentKeyObject(componentId, 'conditions') || [];
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);

    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }

  deleteTripSharedExpense(id: string): void {
    this.tripSharedExpenseService.delete(id, this.tripId!).pipe(
      tap(() => this.localStorageService.setComponentKey(this.componentId, 'selectedId', null)),
      switchMap(() => this.tripSharedExpenseService.getAll(this.tripId!)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((expenses) => {
      this.componentService.updateEntities(expenses);
    });
  }

  private downloadExpensesPdf(): void {
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.documentsService.getTripExpensesReportPdf(this.tripId).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trip-expenses-${this.tripId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}