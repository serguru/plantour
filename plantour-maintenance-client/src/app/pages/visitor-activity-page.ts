import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DateTime, Duration } from 'luxon';
import { finalize } from 'rxjs';
import { BrnDialogService } from '@spartan-ng/brain/dialog';
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
import { ApiErrorResponse } from '../models/auth.models';
import { VisitorActivityPeriod } from '../models/visitor-activity-period.models';
import { VisitorActivityRowDto } from '../models/visitor-activity.models';
import { HlmTable, HlmTableContainer, HlmTBody, HlmTd, HlmTh, HlmTHead, HlmTr } from '../ui/table/src/lib/hlm-table';
import { DataTableTopPanelComponent, DataTableTopPanelGroupingOption, DataTableTopPanelStoredState } from '../components/data-table-top-panel/data-table-top-panel';
import { VisitorActivityPeriodDialogComponent } from '../components/visitor-activity-period-dialog/visitor-activity-period-dialog';
import { VisitorActivityService } from '../services/visitor-activity-service';

@Component({
  selector: 'app-visitor-activity-page',
  imports: [DataTableTopPanelComponent, HlmTableContainer, HlmTable, HlmTHead, HlmTBody, HlmTr, HlmTh, HlmTd, FlexRenderDirective],
  templateUrl: './visitor-activity-page.html',
  styleUrl: './visitor-activity-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisitorActivityPage implements OnInit {
  protected readonly topPanelStorageKey = 'plantour-maintenance.top-panel.visitor-activity';
  private readonly dialogService = inject(BrnDialogService);
  private readonly visitorActivityService = inject(VisitorActivityService);
  private readonly columns: ColumnDef<VisitorActivityRowDto>[] = [
    {
      id: 'day',
      accessorKey: 'day',
      header: 'Day',
      cell: (context) => context.getValue<string>(),
      enableGrouping: true,
    },
    {
      id: 'ip',
      accessorKey: 'ip',
      header: 'IP address',
      cell: (context) => context.getValue<string>(),
      enableGrouping: false,
    },
    {
      accessorFn: (row) => row.country?.trim() || 'Unknown',
      id: 'country',
      header: 'Country',
      cell: (context) => context.getValue<string>(),
      enableGrouping: true,
    },
    {
      accessorFn: (row) => row.city?.trim() || 'Unknown',
      id: 'city',
      header: 'City',
      cell: (context) => context.getValue<string>(),
      enableGrouping: true,
    },
  ];

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly rows = signal<VisitorActivityRowDto[]>([]);
  protected readonly period = signal<VisitorActivityPeriod | null>(null);
  protected readonly filterQuery = signal('');
  protected readonly sorting = signal<SortingState>([{ id: 'day', desc: true }]);
  protected readonly grouping = signal<GroupingState>([]);
  protected readonly pagination = signal<PaginationState>({ pageIndex: 0, pageSize: 20 });
  protected readonly availablePageSizes = [10, 20, 50, 100];
  protected readonly filterId = 'visitor-activity-filter';
  protected readonly groupingId = 'visitor-activity-grouping';
  protected readonly filterLabel = 'Filter';
  protected readonly groupingLabel = 'Group';
  protected readonly filterPlaceholder = 'Filter by day, IP, country or city';
  protected readonly groupingOptions: readonly DataTableTopPanelGroupingOption[] = [
    { value: 'none', label: 'No grouping' },
    { value: 'day', label: 'Day' },
    { value: 'country', label: 'Country' },
    { value: 'city', label: 'City' },
  ];
  protected readonly periodLabel = computed(() => formatVisitorActivityPeriod(this.period()));
  protected readonly durationLabel = computed(() => formatVisitorActivityDuration(this.period()));
  protected readonly groupingValue = computed<GroupColumn>(() => {
    const currentGrouping = this.grouping()[0];

    if (currentGrouping === 'day' || currentGrouping === 'country' || currentGrouping === 'city') {
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
    globalFilterFn: visitorActivityGlobalFilter,
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
        eyebrow: 'Visits period',
        title: 'Filter visits by date',
        applyLabel: 'Apply filter',
        allowClear: true,
      },
      {
        ariaLabel: 'Visitor activity period',
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
    this.grouping.set(normalizeGrouping(state.groupingValue, ['day', 'country', 'city']));
    this.sorting.set(normalizeSorting(state.sorting, ['day', 'ip', 'country', 'city'], [{ id: 'day', desc: true }]));
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

  private loadRows(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.visitorActivityService.getRows(this.period()).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.table.firstPage();
      },
      error: (error: { error?: ApiErrorResponse }) => {
        this.rows.set([]);
        this.table.firstPage();
        this.errorMessage.set(error.error?.message ?? 'Unable to load visitor activity.');
      }
    });
  }
}

function formatVisitorActivityPeriod(period: VisitorActivityPeriod | null): string {
  if (!period) {
    return 'All visits';
  }

  const from = DateTime.fromISO(period.fromUtcIso, { zone: 'utc' }).toLocal();
  const to = DateTime.fromISO(period.toUtcIso, { zone: 'utc' }).toLocal();

  return `${from.toFormat('dd LLL yyyy, HH:mm')} - ${to.toFormat('dd LLL yyyy, HH:mm')}`;
}

function formatVisitorActivityDuration(period: VisitorActivityPeriod | null): string {
  if (!period) {
    return 'Showing visitor activity for every available date.';
  }

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

type GroupColumn = 'day' | 'country' | 'city' | 'none';

const visitorActivityGlobalFilter: FilterFn<VisitorActivityRowDto> = (row, _columnId, filterValue) => {
  const normalizedQuery = normalizeValue(String(filterValue ?? ''));

  if (!normalizedQuery) {
    return true;
  }

  const haystack = [row.original.day, row.original.ip, row.original.country ?? '', row.original.city ?? '']
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