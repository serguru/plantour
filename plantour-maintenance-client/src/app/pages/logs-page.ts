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
import { DataTableTopPanelComponent, DataTableTopPanelGroupingOption } from '../components/data-table-top-panel/data-table-top-panel';
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
  private readonly dialogService = inject(BrnDialogService);
  private readonly logsService = inject(LogsService);
  private readonly columns: ColumnDef<LogRowDto>[] = [
    {
      id: 'timeStamp',
      accessorKey: 'timeStamp',
      header: 'Time',
      cell: (context) => formatTimestamp(context.getValue<string>()),
      enableGrouping: false,
    },
    {
      id: 'level',
      accessorFn: (row) => row.level?.trim() || 'Unknown',
      header: 'Level',
      cell: (context) => context.getValue<string>(),
      enableGrouping: true,
    },
    {
      id: 'eventType',
      accessorFn: (row) => row.eventType?.trim() || 'Unknown',
      header: 'Event type',
      cell: (context) => context.getValue<string>(),
      enableGrouping: true,
    },
    {
      id: 'subtype',
      accessorFn: (row) => row.subtype?.trim() || 'Unknown',
      header: 'Subtype',
      cell: (context) => context.getValue<string>(),
      enableGrouping: true,
    },
    {
      id: 'messageTemplate',
      accessorFn: (row) => row.messageTemplate?.trim() || '-',
      header: 'Message',
      cell: (context) => context.getValue<string>(),
      enableGrouping: false,
    },
    {
      id: 'exception',
      accessorFn: (row) => toSingleLine(row.exception),
      header: 'Exception',
      cell: (context) => context.getValue<string>(),
      enableGrouping: false,
    },
  ];

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly rows = signal<LogRowDto[]>([]);
  protected readonly period = signal<VisitorActivityPeriod>(getDefaultPeriod());
  protected readonly filterQuery = signal('');
  protected readonly sorting = signal<SortingState>([{ id: 'timeStamp', desc: true }]);
  protected readonly grouping = signal<GroupingState>([]);
  protected readonly pagination = signal<PaginationState>({ pageIndex: 0, pageSize: 20 });
  protected readonly availablePageSizes = [10, 20, 50, 100];
  protected readonly filterId = 'logs-filter';
  protected readonly groupingId = 'logs-grouping';
  protected readonly filterLabel = 'Filter rows';
  protected readonly groupingLabel = 'Group rows';
  protected readonly filterPlaceholder = 'Filter by time, level, type, message or exception';
  protected readonly groupingOptions: readonly DataTableTopPanelGroupingOption[] = [
    { value: 'none', label: 'No grouping' },
    { value: 'level', label: 'Level' },
    { value: 'eventType', label: 'Event type' },
    { value: 'subtype', label: 'Subtype' },
  ];
  protected readonly periodLabel = computed(() => formatPeriod(this.period()));
  protected readonly durationLabel = computed(() => formatDuration(this.period()));
  protected readonly groupingValue = computed<GroupColumn>(() => {
    const currentGrouping = this.grouping()[0];

    if (currentGrouping === 'level' || currentGrouping === 'eventType' || currentGrouping === 'subtype') {
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
      { period: this.period() },
      {
        ariaLabel: 'Logs period',
        backdropClass: 'period-dialog-backdrop',
        panelClass: 'period-dialog-panel'
      }
    );

    dialogRef.closed$.subscribe((result) => {
      if (!result) {
        return;
      }

      this.period.set(result);
      this.loadRows();
    });
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
    const { fromUtcIso, toUtcIso } = this.period();

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.logsService.getRows(fromUtcIso, toUtcIso).pipe(
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

function getDefaultPeriod(): VisitorActivityPeriod {
  const toUtc = DateTime.utc();
  const fromUtc = toUtc.minus({ days: 6 }).startOf('day');

  return {
    fromUtcIso: toIsoValue(fromUtc),
    toUtcIso: toIsoValue(toUtc)
  };
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

function toIsoValue(dateTime: DateTime): string {
  return dateTime.toISO({ suppressMilliseconds: true }) ?? '';
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

type GroupColumn = 'level' | 'eventType' | 'subtype' | 'none';

const logsGlobalFilter: FilterFn<LogRowDto> = (row, _columnId, filterValue) => {
  const normalizedQuery = normalizeValue(String(filterValue ?? ''));

  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    formatTimestamp(row.original.timeStamp),
    row.original.level ?? '',
    row.original.eventType ?? '',
    row.original.subtype ?? '',
    row.original.messageTemplate ?? '',
    row.original.exception ?? ''
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