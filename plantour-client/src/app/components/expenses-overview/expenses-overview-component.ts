import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { LocalStorageService } from '../../services/local-storage-service';
import { TripSharedExpenseDto } from '../../services/trip-shared-expense-service';
import { TripUserDto } from '../../services/trip-user-service';

interface TripSharedExpensesOverview {
  total: number;
  assigned: number;
  waitingForAssignment: number;
  rejected: number;
  paid: number;
  waitingForPayment: number;
}

@Component({
  selector: 'app-expenses-overview',
  standalone: true,
  templateUrl: './expenses-overview-component.html',
  styleUrl: './expenses-overview-component.scss',
})
export class ExpensesOverviewComponent implements OnInit {
  componentId = input.required<string>();
  tripSharedExpenses = input<TripSharedExpenseDto[] | null>(null);
  participants = input<TripUserDto[] | null>(null);
  tripCurrencyAbbreviation = input<string | null>(null);
  loaded = input(false);

  private localStorageService = inject(LocalStorageService);

  summaryPanelExpanded = signal(true);

  overview = computed<TripSharedExpensesOverview | null>(() => {
    if (!this.loaded()) {
      return null;
    }

    const expenses = this.tripSharedExpenses() || [];
    const participants = this.participants() || [];
    const total = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const assigned = participants.reduce((sum, item) => sum + (item.sharedAmount || 0), 0);
    const waitingForAssignment = Math.max(total - assigned, 0);
    const rejected = participants
      .filter((item) => item.rejected)
      .reduce((sum, item) => sum + (item.sharedAmount || 0), 0);
    const paid = participants.reduce((sum, item) => sum + (item.sharedPaidAmount || 0), 0);
    const waitingForPayment = Math.max(assigned - paid, 0);

    return {
      total,
      assigned,
      waitingForAssignment,
      rejected,
      paid,
      waitingForPayment,
    };
  });

  ngOnInit(): void {
    this.summaryPanelExpanded.set(
      this.localStorageService.getComponentBooleanKey(this.componentId(), 'overviewExpanded', true)
    );
  }

  onOverviewToggle(event: Event): void {
    const details = event.target as HTMLDetailsElement | null;
    const expanded = !!details?.open;
    this.summaryPanelExpanded.set(expanded);
    this.localStorageService.setComponentKey(this.componentId(), 'overviewExpanded', expanded);
  }

  formatAmount(value: number): string {
    const currency = this.tripCurrencyAbbreviation()?.trim();
    const amount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);

    return currency ? `${currency} ${amount}` : amount;
  }
}