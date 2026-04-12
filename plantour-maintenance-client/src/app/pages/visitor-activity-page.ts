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
  getSortedRowModel,
  type GroupingState,
  type SortingState,
  type Updater,
} from '@tanstack/angular-table';
import { ApiErrorResponse } from '../models/auth.models';
import { VisitorActivityPeriod } from '../models/visitor-activity-period.models';
import { VisitorActivityRowDto } from '../models/visitor-activity.models';
import { HlmInput } from '../ui/input/src/lib/hlm-input';
import { HlmTable, HlmTableContainer, HlmTBody, HlmTd, HlmTh, HlmTHead, HlmTr } from '../ui/table/src/lib/hlm-table';
import { VisitorActivityPeriodDialogComponent } from '../components/visitor-activity-period-dialog/visitor-activity-period-dialog';
import { VisitorActivityService } from '../services/visitor-activity-service';

@Component({
  selector: 'app-visitor-activity-page',
  imports: [HlmInput, HlmTableContainer, HlmTable, HlmTHead, HlmTBody, HlmTr, HlmTh, HlmTd, FlexRenderDirective],
  templateUrl: './visitor-activity-page.html',
  styleUrl: './visitor-activity-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisitorActivityPage implements OnInit {
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
  protected readonly period = signal<VisitorActivityPeriod>(getDefaultPeriod());
  protected readonly filterQuery = signal('');
  protected readonly sorting = signal<SortingState>([{ id: 'day', desc: true }]);
  protected readonly grouping = signal<GroupingState>([]);
  protected readonly periodLabel = computed(() => formatPeriod(this.period()));
  protected readonly durationLabel = computed(() => formatDuration(this.period()));
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
    },
    globalFilterFn: visitorActivityGlobalFilter,
    onGlobalFilterChange: (updater) => this.filterQuery.update((current) => applyUpdater(updater, current)),
    onSortingChange: (updater) => this.sorting.update((current) => applyUpdater(updater, current)),
    onGroupingChange: (updater) => {
      const nextGrouping = applyUpdater(updater, this.grouping());
      this.grouping.set(nextGrouping.length > 1 ? [nextGrouping[0]] : nextGrouping);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  }));
  protected readonly filteredCount = computed(() => this.table.getFilteredRowModel().flatRows.length);
  protected readonly totalCount = computed(() => this.rows().length);

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
        ariaLabel: 'Visitor activity period',
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
  }

  protected updateGrouping(event: Event): void {
    if (!(event.target instanceof HTMLSelectElement)) {
      return;
    }

    const nextGrouping = event.target.value as GroupColumn;
    this.grouping.set(nextGrouping === 'none' ? [] : [nextGrouping]);
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

    this.visitorActivityService.getRows(fromUtcIso, toUtcIso).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (rows) => {
        this.rows.set(rows);
      },
      error: (error: { error?: ApiErrorResponse }) => {
        this.rows.set([]);
        this.errorMessage.set(error.error?.message ?? 'Unable to load visitor activity.');
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