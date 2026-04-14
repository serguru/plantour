import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { DateTime } from 'luxon';
import { DataTableTopPanelComponent, DataTableTopPanelGroupingOption, DataTableTopPanelStoredState } from '../components/data-table-top-panel/data-table-top-panel';
import { SettingUpdateConfirmDialogComponent } from '../components/setting-update-confirm-dialog/setting-update-confirm-dialog';
import { SettingRowDto, SettingValueType } from '../models/setting.models';
import { LocalStorageService } from '../services/local-storage-service';
import { SettingsService } from '../services/settings-service';
import { UsersService } from '../services/users-service';
import { HlmTable, HlmTableContainer, HlmTBody, HlmTd, HlmTh, HlmTHead, HlmTr } from '../ui/table/src/lib/hlm-table';

@Component({
  selector: 'app-settings-page',
  imports: [
    DataTableTopPanelComponent,
    ReactiveFormsModule,
    HlmTableContainer,
    HlmTable,
    HlmTHead,
    HlmTBody,
    HlmTr,
    HlmTh,
    HlmTd,
    FlexRenderDirective,
  ],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPage implements OnInit {
  protected readonly topPanelStorageKey = 'plantour-maintenance.top-panel.settings';
  private readonly selectedSettingStorageKey = 'plantour-maintenance.settings.selected-key';
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogService = inject(BrnDialogService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly settingsService = inject(SettingsService);
  private readonly usersService = inject(UsersService);
  private readonly columns: ColumnDef<SettingRowDto>[] = [
    {
      id: 'key',
      accessorKey: 'key',
      header: 'Key',
      cell: (context) => context.getValue<string>(),
      enableGrouping: false,
    },
    {
      id: 'value',
      accessorKey: 'value',
      header: 'Value',
      cell: (context) => context.getValue<string>(),
      enableGrouping: false,
    },
    {
      id: 'valueType',
      accessorKey: 'valueType',
      header: 'Type',
      cell: (context) => context.getValue<string>(),
      enableGrouping: true,
    },
    {
      id: 'notes',
      accessorFn: (row) => row.notes?.trim() || '—',
      header: 'Notes',
      cell: (context) => context.getValue<string>(),
      enableGrouping: false,
    },
    {
      id: 'updatedAt',
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: (context) => formatTimestamp(context.getValue<string>()),
      enableGrouping: false,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (context) => context.row.original.key,
      enableSorting: false,
      enableGrouping: false,
    },
  ];

  protected readonly isLoading = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly rows = signal<SettingRowDto[]>([]);
  protected readonly selectedKey = signal<string | null>(null);
  protected readonly filterQuery = signal('');
  protected readonly sorting = signal<SortingState>([{ id: 'key', desc: false }]);
  protected readonly grouping = signal<GroupingState>([]);
  protected readonly pagination = signal<PaginationState>({ pageIndex: 0, pageSize: 20 });
  protected readonly availablePageSizes = [10, 20, 50, 100];
  protected readonly filterId = 'settings-filter';
  protected readonly groupingId = 'settings-grouping';
  protected readonly filterLabel = 'Filter';
  protected readonly groupingLabel = 'Group';
  protected readonly filterPlaceholder = 'Filter by key, value, type, notes or updated time';
  protected readonly periodActionLabel = 'Date range';
  protected readonly periodLabel = 'All settings';
  protected readonly durationLabel = 'From and to filters are disabled for this page.';
  protected readonly groupingOptions: readonly DataTableTopPanelGroupingOption[] = [
    { value: 'none', label: 'No grouping' },
    { value: 'valueType', label: 'Type' },
  ];
  protected readonly valueTypes: readonly SettingValueType[] = ['string', 'integer', 'boolean'];
  protected readonly groupingValue = computed<GroupColumn>(() => this.grouping()[0] === 'valueType' ? 'valueType' : 'none');
  protected readonly selectedRow = computed(() => {
    const selectedKey = this.selectedKey();
    return this.rows().find((row) => row.key === selectedKey) ?? null;
  });
  protected readonly hasSelection = computed(() => this.selectedRow() !== null);
  protected readonly table = createAngularTable(() => ({
    data: this.rows(),
    columns: this.columns,
    state: {
      globalFilter: this.filterQuery(),
      sorting: this.sorting(),
      grouping: this.grouping(),
      pagination: this.pagination(),
    },
    globalFilterFn: settingsGlobalFilter,
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
  protected readonly editForm = this.formBuilder.nonNullable.group({
    key: [{ value: '', disabled: true }, [Validators.required]],
    valueType: ['string' as SettingValueType, [Validators.required]],
    value: ['', [Validators.required]],
    notes: [''],
  });

  constructor() {
    this.selectedKey.set(this.localStorageService.getItem(this.selectedSettingStorageKey));

    effect(() => {
      const selectedRow = this.selectedRow();

      if (!selectedRow) {
        this.editForm.reset({
          key: '',
          valueType: 'string',
          value: '',
          notes: '',
        });
        this.editForm.markAsPristine();
        return;
      }

      this.editForm.reset({
        key: selectedRow.key,
        valueType: selectedRow.valueType,
        value: selectedRow.value,
        notes: selectedRow.notes ?? '',
      });
      this.editForm.markAsPristine();
    });

    effect(() => {
      this.localStorageService.setItem(this.selectedSettingStorageKey, this.selectedKey());
    });
  }

  ngOnInit(): void {
    this.loadRows();
  }

  protected restoreTopPanelState(state: DataTableTopPanelStoredState): void {
    this.filterQuery.set(state.filterValue);
    this.grouping.set(normalizeGrouping(state.groupingValue, ['valueType']));
    this.sorting.set(normalizeSorting(state.sorting, ['key', 'value', 'valueType', 'notes', 'updatedAt'], [{ id: 'key', desc: false }]));
    this.table.firstPage();
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

  protected selectRow(row: SettingRowDto): void {
    if (this.isSubmitting()) {
      return;
    }

    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.selectedKey.set(row.key);
  }

  protected resetSelectedRow(): void {
    const selectedRow = this.selectedRow();

    if (!selectedRow) {
      return;
    }

    this.editForm.reset({
      key: selectedRow.key,
      valueType: selectedRow.valueType,
      value: selectedRow.value,
      notes: selectedRow.notes ?? '',
    });
    this.editForm.markAsPristine();
  }

  protected submitUpdate(): void {
    const selectedRow = this.selectedRow();

    if (!selectedRow || this.isSubmitting()) {
      return;
    }

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const request = {
      valueType: this.editForm.controls.valueType.getRawValue(),
      value: this.editForm.controls.value.getRawValue(),
      notes: normalizeOptionalString(this.editForm.controls.notes.getRawValue()),
    };

    const dialogRef = this.dialogService.open(
      SettingUpdateConfirmDialogComponent,
      undefined,
      {
        key: selectedRow.key,
        valueType: request.valueType,
        value: request.value,
        notes: request.notes,
      },
      {
        ariaLabel: `Confirm update for ${selectedRow.key}`,
        backdropClass: 'period-dialog-backdrop',
        panelClass: 'period-dialog-panel'
      }
    );

    dialogRef.closed$.subscribe((confirmed) => {
      if (confirmed !== true) {
        return;
      }

      this.isSubmitting.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      this.settingsService.updateRow(selectedRow.key, request).pipe(
        finalize(() => this.isSubmitting.set(false))
      ).subscribe({
        next: (updatedRow) => {
          this.rows.update((rows) => rows.map((row) => row.key === updatedRow.key ? updatedRow : row));
          this.selectedKey.set(updatedRow.key);
          this.successMessage.set(`Updated ${updatedRow.key}.`);
        },
        error: (error) => {
          this.errorMessage.set(this.usersService.getErrorMessage(error));
        }
      });
    });
  }

  protected isSelected(key: string): boolean {
    return this.selectedKey() === key;
  }

  protected actionLabel(key: string): string {
    return this.isSelected(key) ? 'Editing' : 'Edit';
  }

  protected valueFieldError(): string | null {
    const control = this.editForm.controls.value;

    if (!control.invalid || (!control.touched && !control.dirty)) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Value is required.';
    }

    return null;
  }

  protected valueTypeHelpText(): string {
    switch (this.editForm.controls.valueType.getRawValue()) {
      case 'integer':
        return 'Enter a whole number.';
      case 'boolean':
        return 'Enter true or false.';
      default:
        return 'Text values are stored as-is.';
    }
  }

  private loadRows(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.settingsService.getRows().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (rows) => {
        this.rows.set(rows);

        if (rows.length === 0) {
          this.selectedKey.set(null);
          return;
        }

        const selectedKey = this.selectedKey();
        const hasCurrentSelection = selectedKey && rows.some((row) => row.key === selectedKey);
        this.selectedKey.set(hasCurrentSelection ? selectedKey : rows[0].key);
      },
      error: (error) => {
        this.errorMessage.set(this.usersService.getErrorMessage(error));
      }
    });
  }
}

type GroupColumn = 'none' | 'valueType';

function applyUpdater<T>(updater: Updater<T>, currentValue: T): T {
  return typeof updater === 'function' ? (updater as (value: T) => T)(currentValue) : updater;
}

function normalizeGrouping(value: string, allowedColumns: readonly string[]): GroupingState {
  return allowedColumns.includes(value) ? [value] : [];
}

function normalizeSorting(
  sorting: SortingState,
  allowedColumns: readonly string[],
  fallback: SortingState,
): SortingState {
  const normalizedSorting = sorting.filter((item) => allowedColumns.includes(item.id));
  return normalizedSorting.length > 0 ? normalizedSorting : fallback;
}

function formatTimestamp(utcIso: string): string {
  const parsed = DateTime.fromISO(utcIso, { zone: 'utc' });

  if (!parsed.isValid) {
    return '—';
  }

  return parsed.toLocal().toFormat('dd LLL yyyy, HH:mm:ss');
}

function normalizeOptionalString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const settingsGlobalFilter: FilterFn<SettingRowDto> = (row, _columnId, filterValue) => {
  const normalizedFilter = String(filterValue ?? '').trim().toLowerCase();

  if (!normalizedFilter) {
    return true;
  }

  return [
    row.original.key,
    row.original.value,
    row.original.valueType,
    row.original.notes ?? '',
    formatTimestamp(row.original.updatedAt),
  ].some((value) => value.toLowerCase().includes(normalizedFilter));
};