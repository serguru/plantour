import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, switchMap, tap } from 'rxjs';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { Condition, DynamicQueryService } from '../../services/dynamic-query-service';
import { DocumentsService } from '../../services/documents-service';
import { AssignmentStatus } from '../../helpers/enums';
import { formatDate } from '../../helpers/utils';
import { TripExpenseDto, TripExpenseService } from '../../services/trip-expense-service';
import { TripExpenseItemComponent } from './trip-expense-item/trip-expense-item-component';

@Component({
  selector: 'app-trip-expenses',
  standalone: true,
  imports: [
    EntitiesActionsComponent,
    EntitiesComponent,
    EntitiesHeader,
  ],
  templateUrl: './trip-expenses-component.html',
  styleUrl: './trip-expenses-component.scss',
})
export class TripExpensesComponent implements OnInit {
  tripExpenseItemComponent = TripExpenseItemComponent;
  componentId = 'trip-expenses';
  componentService = inject(ComponentService);
  tripExpenseService = inject(TripExpenseService);
  documentsService = inject(DocumentsService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(DynamicQueryService);

  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private tripId: string | null = null;

  assignmentsVisible = signal<boolean>(true);

  menuItems = computed<MenuConfig[]>(() => [
    {
      label: `${this.assignmentsVisible() ? 'Hide' : 'Show'} Status`,
      icon: 'check',
      action: () => {
        this.assignmentsVisible.set(!this.assignmentsVisible());
        this.localStorageService.setComponentKey(this.componentId, 'assignmentsVisible', this.assignmentsVisible());
      },
    },
    {
      label: 'Download Expenses PDF',
      icon: 'document',
      action: () => this.downloadExpensesPdf(),
    },
  ]);

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
      isSelected: true,
      icon: 'filter',
    },
    {
      kind: 'filter',
      property: 'assignmentStatusName',
      label: 'Expense Type',
      filterText: '',
      comparisonType: 'exact',
      icon: 'filter',
    },
    {
      kind: 'filter',
      property: 'recipientFullName',
      label: 'Recipient',
      filterText: '',
      comparisonType: 'exact',
      icon: 'filter',
    },
    {
      kind: 'filter',
      property: 'paymentMethod',
      label: 'Payment Method',
      filterText: '',
      comparisonType: 'exact',
      icon: 'filter',
    },
    {
      kind: 'filter',
      property: 'effectiveCurrency',
      label: 'Currency',
      filterText: '',
      comparisonType: 'exact',
      icon: 'filter',
    },
  ];

  itemMetaData: any = {
    assignmentsVisible: this.assignmentsVisible,
  };

  ngOnInit(): void {
    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.initConditions(this.componentId);

    this.tripExpenseService.getAll(this.tripId).pipe(
      map((expenses: TripExpenseDto[]) => {
        expenses.forEach((expense) => this.generateMessagesData(expense));
        return expenses;
      }),
      tap((expenses: TripExpenseDto[]) => {
        this.initSavedFeatures(expenses);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((expenses) => {
      this.componentService.updateEntities(expenses || []);
    });
  }

  initSavedFeatures(items: TripExpenseDto[]) {
    const actionsVisible = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(actionsVisible);

    let id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    if (!items || !items.find(x => x.id === id)) {
      id = null;
    }
    this.componentService.updateSelectedId(id);

    const assignmentsVisible = this.localStorageService.getComponentBooleanKey(this.componentId, 'assignmentsVisible', true);
    this.assignmentsVisible.set(assignmentsVisible);
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

  deleteTripExpense(id: string): void {
    this.tripExpenseService.delete(id, this.tripId!).pipe(
      switchMap(() => this.tripExpenseService.getAll(this.tripId!)),
      map((expenses: TripExpenseDto[]) => {
        expenses.forEach((expense) => this.generateMessagesData(expense));
        return expenses;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((expenses) => {
      this.componentService.updateEntities(expenses);
    });
  }

  generateMessagesData = (expense: TripExpenseDto) => {
    const parts: string[] = [];

    if (expense.recipientFirstName || expense.recipientLastName || expense.recipientEmail) {
      expense.recipientFullName = [expense.recipientFirstName, expense.recipientLastName]
        .filter(Boolean)
        .join(' ')
        || expense.recipientEmail
        || null;
    } else {
      expense.recipientFullName = null;
    }

    if (expense.tripSharedExpenseId) {
      expense.assignmentStatus = AssignmentStatus.AssignedNotFinished;
      expense.assignmentStatusName = 'Shared Expense';
      if (expense.assignedAt) {
        parts.push(`Accepted on ${formatDate(expense.assignedAt)}`);
      } else {
        parts.push('Accepted shared expense');
      }
      if (expense.assignedDeadline) {
        parts.push(`Deadline ${formatDate(expense.assignedDeadline)}`);
      }
      expense.assignmentStatusText = parts.join('. ');
      return;
    }

    if (expense.recipientId) {
      expense.assignmentStatus = AssignmentStatus.FinishedSuccess;
      expense.assignmentStatusName = 'Money Transfer';
      expense.assignmentStatusText = expense.recipientFullName
        ? `Money transfer to ${expense.recipientFullName}`
        : 'Money transfer';
      return;
    }

    expense.assignmentStatus = AssignmentStatus.NotAssigned;
    expense.assignmentStatusName = 'Personal Expense';
    expense.assignmentStatusText = 'Personal expense';
  };

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