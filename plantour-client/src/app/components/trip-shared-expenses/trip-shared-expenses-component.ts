import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, switchMap, tap } from 'rxjs';
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

interface TripSharedExpensesOverview {
  total: number;
  assigned: number;
  waitingForAssignment: number;
  accepted: number;
  rejected: number;
  paid: number;
  waitingForPayment: number;
}

@Component({
  selector: 'app-trip-shared-expenses',
  standalone: true,
  imports: [
    CommonModule,
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

  itemMetaData: { tripCurrencyAbbreviation: string | null } = {
    tripCurrencyAbbreviation: null,
  };
  summaryPanelExpanded = signal<boolean>(true);
  overview = signal<TripSharedExpensesOverview | null>(null);

  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private tripId: string | null = null;

  menuItems = computed<MenuConfig[]>(() => {
    return [
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
    this.summaryPanelExpanded.set(
      this.localStorageService.getComponentBooleanKey(this.componentId, 'overviewExpanded', true)
    );

    combineLatest([
      this.tripSharedExpenseService.getAll(this.tripId),
      this.tripService.getById(this.tripId),
      this.tripUserService.getAll(this.tripId),
    ]).pipe(
      tap(([expenses, trip, participants]) => {
        this.itemMetaData.tripCurrencyAbbreviation = trip.currency;
        this.overview.set(this.buildOverview(expenses, participants));
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

  onOverviewToggle(event: Event): void {
    const details = event.target as HTMLDetailsElement | null;
    const expanded = !!details?.open;
    this.summaryPanelExpanded.set(expanded);
    this.localStorageService.setComponentKey(this.componentId, 'overviewExpanded', expanded);
  }

  formatAmount(value: number): string {
    const currency = this.itemMetaData.tripCurrencyAbbreviation?.trim();
    const amount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);

    return currency ? `${currency} ${amount}` : amount;
  }

  private buildOverview(expenses: TripSharedExpenseDto[], participants: TripUserDto[]): TripSharedExpensesOverview {
    const total = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const assigned = participants.reduce((sum, item) => sum + (item.sharedAmount || 0), 0);
    const waitingForAssignment = Math.max(total - assigned, 0);
    const accepted = participants
      .filter((item) => item.accept === 'accepted')
      .reduce((sum, item) => sum + (item.sharedAmount || 0), 0);
    const rejected = participants
      .filter((item) => item.accept === 'rejected')
      .reduce((sum, item) => sum + (item.sharedAmount || 0), 0);
    const paid = participants.reduce((sum, item) => sum + (item.sharedPaidAmount || 0), 0);
    const waitingForPayment = Math.max(assigned - paid, 0);

    return {
      total,
      assigned,
      waitingForAssignment,
      accepted,
      rejected,
      paid,
      waitingForPayment,
    };
  }
}