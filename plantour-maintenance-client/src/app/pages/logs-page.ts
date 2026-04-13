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
import { LogRowDto } from '../models/log.models';
import { VisitorActivityPeriod } from '../models/visitor-activity-period.models';
import { HlmTable, HlmTableContainer, HlmTBody, HlmTd, HlmTh, HlmTHead, HlmTr } from '../ui/table/src/lib/hlm-table';
import { DataTableTopPanelComponent, DataTableTopPanelGroupingOption, DataTableTopPanelStoredState } from '../components/data-table-top-panel/data-table-top-panel';
import { VisitorActivityPeriodDialogComponent } from '../components/visitor-activity-period-dialog/visitor-activity-period-dialog';
import { LogsService } from '../services/logs-service';

@Component({
  selector: 'app-logs-page',
  imports: [DataTableTopPanelComponent, HlmTableContainer, HlmTable, HlmTHead, HlmTBody, HlmTr, HlmTh, HlmTd, FlexRenderDirective],
  templateUrl: './logs-page.html',
  styleUrl: './logs-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogsPage implements OnInit {
  protected readonly topPanelStorageKey = 'plantour-maintenance.top-panel.logs';
  private readonly dialogService = inject(BrnDialogService);
  private readonly logsService = inject(LogsService);
  private readonly columns: ColumnDef<LogRowDto>[] = [
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Time',
      cell: (context) => formatTimestamp(context.getValue<string>()),
      enableGrouping: false,
    },
    {
      id: 'severity',
      accessorFn: (row) => formatSeverity(row.severity),
      header: 'Severity',
      cell: (context) => context.getValue<string>(),
      enableGrouping: true,
    },
    {
      id: 'category',
      accessorFn: (row) => row.category.trim() || 'Unknown',
      header: 'Category',
      cell: (context) => context.getValue<string>(),
      enableGrouping: true,
    },
    {
      id: 'message',
      accessorFn: (row) => row.message.trim() || '-',
      header: 'Message',
      cell: (context) => context.getValue<string>(),
      enableGrouping: false,
    },
    {
      id: 'userId',
      accessorFn: (row) => row.userId?.trim() || '-',
      header: 'User',
      cell: (context) => context.getValue<string>(),
      enableGrouping: false,
    },
    {
      id: 'properties',
      accessorFn: (row) => formatProperties(row.properties),
      header: 'Properties',
      cell: (context) => context.getValue<string>(),
      enableGrouping: false,
    },
  ];

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly rows = signal<LogRowDto[]>([]);
  protected readonly period = signal<VisitorActivityPeriod | null>(null);
  protected readonly filterQuery = signal('');
  protected readonly sorting = signal<SortingState>([{ id: 'createdAt', desc: true }]);
  protected readonly grouping = signal<GroupingState>([]);
  protected readonly pagination = signal<PaginationState>({ pageIndex: 0, pageSize: 20 });
  protected readonly availablePageSizes = [10, 20, 50, 100];
  protected readonly filterId = 'logs-filter';
  protected readonly groupingId = 'logs-grouping';
  protected readonly filterLabel = 'Filter';
  protected readonly groupingLabel = 'Group';
  protected readonly filterPlaceholder = 'Filter by time, severity, category, message, user or properties';
  protected readonly groupingOptions: readonly DataTableTopPanelGroupingOption[] = [
    { value: 'none', label: 'No grouping' },
    { value: 'severity', label: 'Severity' },
    { value: 'category', label: 'Category' },
  ];
  protected readonly periodLabel = computed(() => formatLogsPeriod(this.period()));
  protected readonly durationLabel = computed(() => formatLogsDuration(this.period()));
  protected readonly groupingValue = computed<GroupColumn>(() => {
    const currentGrouping = this.grouping()[0];

    if (currentGrouping === 'severity' || currentGrouping === 'category') {
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
    globalFilterFn: logsGlobalFilter,
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
        eyebrow: 'Logs period',
        title: 'Filter logs by date',
        applyLabel: 'Apply filter',
        allowClear: true,
      },
      {
        ariaLabel: 'Logs period',
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
    this.grouping.set(normalizeGrouping(state.groupingValue, ['severity', 'category']));
    this.sorting.set(normalizeSorting(state.sorting, ['createdAt', 'severity', 'category', 'message', 'userId', 'properties'], [{ id: 'createdAt', desc: true }]));
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

    this.logsService.getRows(this.period()).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.table.firstPage();
      },
      error: (error: { error?: ApiErrorResponse }) => {
        this.rows.set([]);
        this.table.firstPage();
        this.errorMessage.set(error.error?.message ?? 'Unable to load logs.');
      }
    });
  }
}

function formatLogsPeriod(period: VisitorActivityPeriod | null): string {
  if (!period) {
    return 'All logs';
  }

  const from = DateTime.fromISO(period.fromUtcIso, { zone: 'utc' }).toLocal();
  const to = DateTime.fromISO(period.toUtcIso, { zone: 'utc' }).toLocal();

  return `${from.toFormat('dd LLL yyyy, HH:mm')} - ${to.toFormat('dd LLL yyyy, HH:mm')}`;
}

function formatLogsDuration(period: VisitorActivityPeriod | null): string {
  if (!period) {
    return 'Showing logs for every available date.';
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

function formatTimestamp(value: string): string {
  const parsed = DateTime.fromISO(value, { zone: 'utc' });

  if (!parsed.isValid) {
    return value;
  }

  return parsed.toLocal().toFormat('dd LLL yyyy, HH:mm:ss');
}

function toSingleLine(value: string | null | undefined): string {
  const normalized = value?.replace(/\s+/g, ' ').trim();
  return normalized || '-';
}

type GroupColumn = 'severity' | 'category' | 'none';

const logsGlobalFilter: FilterFn<LogRowDto> = (row, _columnId, filterValue) => {
  const normalizedQuery = normalizeValue(String(filterValue ?? ''));

  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    formatTimestamp(row.original.createdAt),
    formatSeverity(row.original.severity),
    row.original.category ?? '',
    row.original.message ?? '',
    row.original.userId ?? '',
    formatProperties(row.original.properties)
  ]
    .map(normalizeValue)
    .join(' ');

  return haystack.includes(normalizedQuery);
};

function normalizeValue(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function formatSeverity(value: string): string {
  return value === 'i' ? 'Info' : value === 'w' ? 'Warning' : value === 'e' ? 'Error' : value;
}

function formatProperties(value: string | null | undefined): string {
  return toSingleLine(value);
}

function applyUpdater<T>(updater: Updater<T>, currentValue: T): T {
  return typeof updater === 'function' ? (updater as (value: T) => T)(currentValue) : updater;
}