// TODO: Why if sign in with bob.green@example.com it shows "Hello Robin Miles, we've sent you an email with a link that will be valid for 60 minutes. Please open the email and follow the link to sign in to Plantour."
// TODO: add reset to AI prompts
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { BrnDialogService } from '@spartan-ng/brain/dialog';
import { DateTime, Duration } from 'luxon';
import { finalize } from 'rxjs';
import {
  type ColumnDef,
  createAngularTable,
  FlexRenderDirective,
  type FilterFn,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type GroupingState,
  type PaginationState,
  type SortingState,
  type Updater,
} from '@tanstack/angular-table';
import { VisitorActivityPeriodDialogComponent } from '../components/visitor-activity-period-dialog/visitor-activity-period-dialog';
import { DataTableTopPanelComponent, DataTableTopPanelGroupingOption, DataTableTopPanelStoredState } from '../components/data-table-top-panel/data-table-top-panel';
import { PlantourUserRowDto } from '../models/plantour-user.models';
import { VisitorActivityPeriod } from '../models/visitor-activity-period.models';
import { PlantourUsersService } from '../services/plantour-users-service';
import { UsersService } from '../services/users-service';
import { HlmTable, HlmTableContainer, HlmTBody, HlmTd, HlmTh, HlmTHead, HlmTr } from '../ui/table/src/lib/hlm-table';

@Component({
  selector: 'app-users-page',
  imports: [DataTableTopPanelComponent, HlmTableContainer, HlmTable, HlmTHead, HlmTBody, HlmTr, HlmTh, HlmTd, FlexRenderDirective, JsonPipe],
  templateUrl: './users-page.html',
  styleUrl: './users-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersPage implements OnInit {
  protected readonly topPanelStorageKey = 'plantour-maintenance.top-panel.users';
  private readonly dialogService = inject(BrnDialogService);
  private readonly plantourUsersService = inject(PlantourUsersService);
  private readonly usersService = inject(UsersService);
  private readonly columns: ColumnDef<PlantourUserRowDto>[] = [
    {
      id: 'id',
      accessorKey: 'id',
      header: 'Id',
      cell: (context) => context.getValue<string>(),
      enableGrouping: false,
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'Email',
      cell: (context) => context.getValue<string>(),
      enableGrouping: false,
    },
    {
      id: 'fullName',
      accessorFn: (row) => row.fullName?.trim() || '—',
      header: 'Full name',
      cell: (context) => context.getValue<string>(),
      enableGrouping: false,
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: 'Role',
      cell: (context) => context.getValue<string>(),
      enableGrouping: true,
    },
    {
      id: 'plan',
      accessorFn: (row) => row.plan?.trim() || '—',
      header: 'Stripe plan',
      cell: (context) => context.getValue<string>(),
      enableGrouping: true,
    },
    {
      id: 'stripeCustomerId',
      accessorFn: (row) => row.stripeCustomerId?.trim() || '—',
      header: 'Stripe customer',
      cell: (context) => context.getValue<string>(),
      enableGrouping: false,
    },
    {
      id: 'stripeCustomerStatus',
      accessorFn: (row) => row.stripeCustomerStatus?.trim() || '—',
      header: 'Customer status',
      cell: (context) => context.getValue<string>(),
      enableGrouping: true,
    },
    {
      id: 'stripeSubscriptionId',
      accessorFn: (row) => row.stripeSubscriptionId?.trim() || '—',
      header: 'Stripe subscription',
      cell: (context) => context.getValue<string>(),
      enableGrouping: false,
    },
    {
      id: 'stripeSubscriptionStatus',
      accessorFn: (row) => row.stripeSubscriptionStatus?.trim() || '—',
      header: 'Subscription status',
      cell: (context) => context.getValue<string>(),
      enableGrouping: true,
    },
    {
      id: 'stripePriceId',
      accessorFn: (row) => row.stripePriceId?.trim() || '—',
      header: 'Stripe price',
      cell: (context) => context.getValue<string>(),
      enableGrouping: true,
    },
    {
      id: 'temporary',
      accessorFn: (row) => booleanLabel(row.temporary),
      header: 'Temporary',
      cell: (context) => context.getValue<string>(),
      enableGrouping: true,
    },
    {
      id: 'dateJoined',
      accessorKey: 'dateJoined',
      header: 'Date joined',
      cell: (context) => formatTimestamp(context.getValue<string>()),
      enableGrouping: false,
    },
    {
      id: 'hasActiveSubscription',
      accessorFn: (row) => booleanLabel(row.hasActiveSubscription),
      header: 'Active subscription',
      cell: (context) => context.getValue<string>(),
      enableGrouping: true,
    },
    {
      id: 'latestPlanStartedAt',
      accessorFn: (row) => row.latestPlanStartedAt ?? '',
      header: 'Latest plan start',
      cell: (context) => formatOptionalTimestamp(context.getValue<string>()),
      enableGrouping: false,
    },
    {
      id: 'lastVisitAt',
      accessorFn: (row) => row.lastVisitAt ?? '',
      header: 'Last visit',
      cell: (context) => formatOptionalTimestamp(context.getValue<string>()),
      enableGrouping: false,
    },
    {
      id: 'tripsCount',
      accessorKey: 'tripsCount',
      header: 'Trips',
      cell: (context) => String(context.getValue<number>()),
      enableGrouping: false,
    },
    {
      id: 'itemsCount',
      accessorKey: 'itemsCount',
      header: 'Items',
      cell: (context) => String(context.getValue<number>()),
      enableGrouping: false,
    },
    {
      id: 'todosCount',
      accessorKey: 'todosCount',
      header: 'Todos',
      cell: (context) => String(context.getValue<number>()),
      enableGrouping: false,
    },
    {
      id: 'expensesCount',
      accessorKey: 'expensesCount',
      header: 'Expenses',
      cell: (context) => String(context.getValue<number>()),
      enableGrouping: false,
    },
    {
      id: 'travelersCount',
      accessorKey: 'travelersCount',
      header: 'Travelers',
      cell: (context) => String(context.getValue<number>()),
      enableGrouping: false,
    },
    {
      id: 'paymentsTotal',
      accessorFn: (row) => row.paymentsTotal?.trim() || '—',
      header: 'Payments total',
      cell: (context) => context.getValue<string>(),
      enableGrouping: false,
    },
  ];

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly rows = signal<PlantourUserRowDto[]>([]);
  protected readonly period = signal<VisitorActivityPeriod | null>(null);
  protected readonly filterQuery = signal('');
  protected readonly sorting = signal<SortingState>([{ id: 'dateJoined', desc: true }]);
  protected readonly grouping = signal<GroupingState>([]);
  protected readonly pagination = signal<PaginationState>({ pageIndex: 0, pageSize: 20 });
  
  // Right panel signals
  protected readonly showRightPanel = signal(false);
  protected readonly selectedUserId = signal<string | null>(null);
  protected readonly comprehensiveData = signal<string | null>(null);
  protected readonly isLoadingComprehensiveData = signal(false);
  protected readonly comprehensiveDataError = signal<string | null>(null);
  protected readonly availablePageSizes = [10, 20, 50, 100];

  // Computed signal to parse JSON data
  protected readonly parsedComprehensiveData = computed(() => {
    const jsonString = this.comprehensiveData();
    if (!jsonString) {
      return null;
    }

    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  });

  // Computed signal to get user ID from parsed data
  protected readonly comprehensiveDataUserId = computed(() => {
    const parsedData = this.parsedComprehensiveData();
    return parsedData?.id || 'Unknown';
  });
  protected readonly filterId = 'users-filter';
  protected readonly groupingId = 'users-grouping';
  protected readonly filterLabel = 'Filter';
  protected readonly groupingLabel = 'Group';
  protected readonly filterPlaceholder = 'Filter by email, role, Stripe ids, plan, totals or counts';
  protected readonly periodActionLabel = 'Created period';
  protected readonly periodLabel = computed(() => formatUsersPeriod(this.period()));
  protected readonly durationLabel = computed(() => formatUsersDuration(this.period()));
  protected readonly groupingOptions: readonly DataTableTopPanelGroupingOption[] = [
    { value: 'none', label: 'No grouping' },
    { value: 'role', label: 'Role' },
    { value: 'plan', label: 'Plan' },
    { value: 'temporary', label: 'Temporary' },
    { value: 'hasActiveSubscription', label: 'Active subscription' },
  ];
  protected readonly groupingValue = computed<GroupColumn>(() => {
    const currentGrouping = this.grouping()[0];

    if (currentGrouping === 'role' || currentGrouping === 'plan' || currentGrouping === 'temporary' || currentGrouping === 'hasActiveSubscription') {
      return currentGrouping;
    }

    return 'none';
  });
  protected readonly table = createAngularTable(() => ({
    data: this.rows(),
    columns: this.columns,
    state: {
      globalFilter: this.filterQuery(),
      sorting: this.sorting(),
      grouping: this.grouping(),
      pagination: this.pagination(),
    },
    globalFilterFn: usersGlobalFilter,
    onGlobalFilterChange: (updater) => this.filterQuery.update((current) => applyUpdater(updater, current)),
    onSortingChange: (updater) => this.sorting.update((current) => applyUpdater(updater, current)),
    onPaginationChange: (updater) => this.pagination.update((current) => applyUpdater(updater, current)),
    onGroupingChange: (updater) => {
      const nextGrouping = applyUpdater(updater, this.grouping());
      this.grouping.set(nextGrouping.length > 1 ? [nextGrouping[0]] : nextGrouping);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  }));
  protected readonly filteredRowCount = computed(() => this.table.getFilteredRowModel().rows.length);
  protected readonly totalRowCount = computed(() => this.table.getCoreRowModel().rows.length);
  protected readonly currentPageLabel = computed(() => this.pagination().pageIndex + 1);
  protected readonly totalPageCount = computed(() => Math.max(this.table.getPageCount(), 1));

  ngOnInit(): void {
    this.loadRows();
  }

  protected openPeriodDialog(): void {
    if (this.isLoading()) {
      return;
    }

    const dialogRef = this.dialogService.open(
      VisitorActivityPeriodDialogComponent,
      undefined,
      {
        period: this.period(),
        eyebrow: 'Users period',
        title: 'Filter users by created date',
        applyLabel: 'Apply filter',
        allowClear: true,
      },
      {
        ariaLabel: 'Users created period',
        backdropClass: 'period-dialog-backdrop',
        panelClass: 'period-dialog-panel'
      }
    );

    dialogRef.closed$.subscribe((result) => {
      if (result === undefined) {
        return;
      }

      this.period.set(result);
      this.loadRows();
    });
  }

  protected restoreTopPanelState(state: DataTableTopPanelStoredState): void {
    const nextPeriod = state.period;
    const periodChanged = !samePeriod(this.period(), nextPeriod);

    this.filterQuery.set(state.filterValue);
    this.period.set(nextPeriod);
    this.grouping.set(normalizeGrouping(state.groupingValue, ['role', 'plan', 'temporary', 'hasActiveSubscription']));
    this.sorting.set(normalizeSorting(state.sorting, ['id', 'email', 'fullName', 'role', 'plan', 'stripeCustomerId', 'stripeCustomerStatus', 'stripeSubscriptionId', 'stripeSubscriptionStatus', 'stripePriceId', 'temporary', 'dateJoined', 'hasActiveSubscription', 'latestPlanStartedAt', 'lastVisitAt', 'tripsCount', 'itemsCount', 'todosCount', 'expensesCount', 'travelersCount', 'paymentsTotal'], [{ id: 'dateJoined', desc: true }]));
    this.table.firstPage();

    if (periodChanged) {
      this.loadRows();
    }
  }

  protected updateFilter(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }

    const nextValue = event.target.value;
    this.filterQuery.set(nextValue);
    this.table.setGlobalFilter(nextValue);
    this.table.firstPage();
  }

  protected updateGrouping(event: Event): void {
    if (!(event.target instanceof HTMLSelectElement)) {
      return;
    }

    const nextGrouping = event.target.value as GroupColumn;
    this.grouping.set(nextGrouping === 'none' ? [] : [nextGrouping]);
    this.table.firstPage();
  }

  protected updatePageSize(event: Event): void {
    if (!(event.target instanceof HTMLSelectElement)) {
      return;
    }

    const pageSize = Number(event.target.value);

    if (!Number.isFinite(pageSize) || pageSize <= 0) {
      return;
    }

    this.table.setPageSize(pageSize);
    this.table.firstPage();
  }

  protected toggleSorting(columnId: string): void {
    const column = this.table.getColumn(columnId);

    if (!column?.getCanSort()) {
      return;
    }

    column.toggleSorting(column.getIsSorted() === 'asc');
  }

  protected sortIndicator(columnId: string): string {
    const direction = this.table.getColumn(columnId)?.getIsSorted();

    if (direction === 'asc') {
      return '↑';
    }

    if (direction === 'desc') {
      return '↓';
    }

    return '↕';
  }

  protected toggleRightPanel(): void {
    const newState = !this.showRightPanel();
    this.showRightPanel.set(newState);
    
    if (newState && this.selectedUserId()) {
      this.loadComprehensiveData();
    } else {
      this.comprehensiveData.set(null);
      this.comprehensiveDataError.set(null);
    }
  }

  protected selectUser(userId: string): void {
    this.selectedUserId.set(userId);
    
    if (this.showRightPanel()) {
      this.loadComprehensiveData();
    }
  }

  protected loadComprehensiveData(): void {
    const userId = this.selectedUserId();
    if (!userId) {
      return;
    }

    this.isLoadingComprehensiveData.set(true);
    this.comprehensiveDataError.set(null);

    console.log('Loading comprehensive data for user:', userId);
    
    this.plantourUsersService.getComprehensiveData(userId).pipe(
      finalize(() => this.isLoadingComprehensiveData.set(false))
    ).subscribe({
      next: (data) => {
        console.log('Comprehensive data loaded successfully:', data);
        this.comprehensiveData.set(data);
      },
      error: (error: unknown) => {
        console.error('Error loading comprehensive data:', error);
        this.comprehensiveData.set(null);
        this.comprehensiveDataError.set(this.usersService.getErrorMessage(error));
      }
    });
  }

  protected downloadJson(): void {
    const jsonString = this.comprehensiveData();
    if (!jsonString) {
      return;
    }

    // Parse the JSON to get the user ID for the filename
    let userId = 'unknown';
    try {
      const data = JSON.parse(jsonString);
      userId = data.id || 'unknown';
    } catch {
      // If parsing fails, use default filename
    }

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-${userId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  protected copyJsonToClipboard(): void {
    const jsonString = this.comprehensiveData();
    if (!jsonString) {
      return;
    }

    // Use the Clipboard API
    navigator.clipboard.writeText(jsonString).then(
      () => {
        // Show a temporary success message (could be enhanced with a toast notification)
        console.log('JSON copied to clipboard');
        // Optionally, you could add a visual feedback here
      },
      (err) => {
        console.error('Failed to copy JSON: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = jsonString;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          console.log('JSON copied to clipboard using fallback');
        } catch (err) {
          console.error('Fallback copy failed: ', err);
        }
        document.body.removeChild(textArea);
      }
    );
  }

  private loadRows(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.plantourUsersService.getRows(this.period()).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.table.firstPage();
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.table.firstPage();
        this.errorMessage.set(this.usersService.getErrorMessage(error));
      }
    });
  }
}

function formatTimestamp(value: string): string {
  const parsed = DateTime.fromISO(value, { zone: 'utc' });

  if (!parsed.isValid) {
    return value;
  }

  return parsed.toLocal().toFormat('dd LLL yyyy, HH:mm:ss');
}

function formatOptionalTimestamp(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }

  return formatTimestamp(value);
}

function booleanLabel(value: boolean): string {
  return value ? 'Yes' : 'No';
}

type GroupColumn = 'role' | 'plan' | 'temporary' | 'hasActiveSubscription' | 'none';

const usersGlobalFilter: FilterFn<PlantourUserRowDto> = (row, _columnId, filterValue) => {
  const normalizedQuery = normalizeValue(String(filterValue ?? ''));

  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    row.original.id,
    row.original.email,
    row.original.fullName ?? '',
    row.original.role,
    row.original.plan ?? '',
    row.original.stripeCustomerId ?? '',
    row.original.stripeCustomerStatus ?? '',
    row.original.stripeSubscriptionId ?? '',
    row.original.stripeSubscriptionStatus ?? '',
    row.original.stripePriceId ?? '',
    booleanLabel(row.original.temporary),
    formatTimestamp(row.original.dateJoined),
    booleanLabel(row.original.hasActiveSubscription),
    formatOptionalTimestamp(row.original.latestPlanStartedAt),
    formatOptionalTimestamp(row.original.lastVisitAt),
    String(row.original.tripsCount),
    String(row.original.itemsCount),
    String(row.original.todosCount),
    String(row.original.expensesCount),
    String(row.original.travelersCount),
    row.original.paymentsTotal ?? ''
  ]
    .map(normalizeValue)
    .join(' ');

  return haystack.includes(normalizedQuery);
};

function normalizeValue(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function applyUpdater<T>(updater: Updater<T>, currentValue: T): T {
  return typeof updater === 'function' ? (updater as (value: T) => T)(currentValue) : updater;
}

function normalizeGrouping(value: string, allowedValues: readonly string[]): GroupingState {
  return allowedValues.includes(value) ? [value] : [];
}

function normalizeSorting(value: SortingState, allowedColumns: readonly string[], fallback: SortingState): SortingState {
  const normalized = value.filter((item) => allowedColumns.includes(item.id));
  return normalized.length > 0 ? normalized : fallback;
}

function samePeriod(left: VisitorActivityPeriod | null, right: VisitorActivityPeriod | null): boolean {
  return left?.fromUtcIso === right?.fromUtcIso && left?.toUtcIso === right?.toUtcIso;
}

function formatUsersPeriod(period: VisitorActivityPeriod | null): string {
  if (!period) {
    return 'All users';
  }

  return formatPeriod(period);
}

function formatUsersDuration(period: VisitorActivityPeriod | null): string {
  if (!period) {
    return 'Showing every user regardless of created_at. Payments total is aggregated from paid Stripe invoices.';
  }

  return `Created within ${formatDuration(period)}. Payments total is aggregated from paid Stripe invoices.`;
}

function formatPeriod(period: VisitorActivityPeriod): string {
  const from = DateTime.fromISO(period.fromUtcIso, { zone: 'utc' }).toLocal();
  const to = DateTime.fromISO(period.toUtcIso, { zone: 'utc' }).toLocal();

  return `${from.toFormat('dd LLL yyyy, HH:mm')} - ${to.toFormat('dd LLL yyyy, HH:mm')}`;
}

function formatDuration(period: VisitorActivityPeriod): string {
  const from = DateTime.fromISO(period.fromUtcIso, { zone: 'utc' });
  const to = DateTime.fromISO(period.toUtcIso, { zone: 'utc' });
  const duration = to.diff(from, ['days', 'hours', 'minutes']).shiftTo('days', 'hours', 'minutes');

  return toDurationLabel(duration);
}

function toDurationLabel(duration: Duration): string {
  const days = Math.floor(duration.days);
  const hours = Math.floor(duration.hours);
  const minutes = Math.floor(duration.minutes);
  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }

  if (hours > 0 || parts.length > 0) {
    parts.push(`${hours}h`);
  }

  parts.push(`${minutes}m`);
  return parts.join(' ');
}