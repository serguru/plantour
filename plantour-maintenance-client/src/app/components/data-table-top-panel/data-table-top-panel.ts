import { afterNextRender, ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { type SortingState } from '@tanstack/angular-table';
import { VisitorActivityPeriod } from '../../models/visitor-activity-period.models';
import { HlmInput } from '../../ui/input/src/lib/hlm-input';
import { LocalStorageService } from '../../services/local-storage-service';

export interface DataTableTopPanelGroupingOption {
  value: string;
  label: string;
}

export interface DataTableTopPanelStoredState {
  filterValue: string;
  groupingValue: string;
  sorting: SortingState;
  period: VisitorActivityPeriod | null;
}

@Component({
  selector: 'app-data-table-top-panel',
  imports: [HlmInput],
  templateUrl: './data-table-top-panel.html',
  styleUrl: './data-table-top-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableTopPanelComponent {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly persistenceReady = signal(false);

  readonly isLoading = input(false);
  readonly showPeriodSelector = input(true);
  readonly periodActionLabel = input('Selected period');
  readonly periodLabel = input('');
  readonly durationLabel = input('');
  readonly storageKey = input<string | null>(null);
  readonly periodState = input<VisitorActivityPeriod | null>(null);
  readonly filterId = input.required<string>();
  readonly filterLabel = input.required<string>();
  readonly filterPlaceholder = input.required<string>();
  readonly filterValue = input('');
  readonly groupingId = input.required<string>();
  readonly groupingLabel = input.required<string>();
  readonly groupingValue = input.required<string>();
  readonly groupingOptions = input.required<readonly DataTableTopPanelGroupingOption[]>();
  readonly sortingState = input<SortingState>([]);

  readonly periodClick = output<void>();
  readonly filterChange = output<Event>();
  readonly groupingChange = output<Event>();
  readonly stateRestore = output<DataTableTopPanelStoredState>();

  constructor() {
    effect(() => {
      if (!this.persistenceReady()) {
        return;
      }

      const storageKey = this.storageKey();
      if (!storageKey) {
        return;
      }

      const storedState: DataTableTopPanelStoredState = {
        filterValue: this.filterValue(),
        groupingValue: this.groupingValue(),
        sorting: normalizeSortingState(this.sortingState()),
        period: normalizePeriodState(this.periodState())
      };

      this.localStorageService.setItem(storageKey, JSON.stringify(storedState));
    });

    afterNextRender(() => {
      this.restorePersistedState();
      queueMicrotask(() => this.persistenceReady.set(true));
    });
  }

  protected onPeriodClick(): void {
    if (this.isLoading()) {
      return;
    }

    this.periodClick.emit();
  }

  protected onFilterChange(event: Event): void {
    this.filterChange.emit(event);
  }

  protected onGroupingChange(event: Event): void {
    this.groupingChange.emit(event);
  }

  private restorePersistedState(): void {
    const storageKey = this.storageKey();
    if (!storageKey) {
      return;
    }

    const storedState = this.localStorageService.getItemObject<Partial<DataTableTopPanelStoredState>>(storageKey);
    if (!storedState) {
      return;
    }

    this.stateRestore.emit({
      filterValue: typeof storedState.filterValue === 'string' ? storedState.filterValue : '',
      groupingValue: typeof storedState.groupingValue === 'string' ? storedState.groupingValue : 'none',
      sorting: normalizeSortingState(storedState.sorting),
      period: normalizePeriodState(storedState.period)
    });
  }
}

function normalizeSortingState(value: unknown): SortingState {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is { id: unknown; desc: unknown } => typeof item === 'object' && item !== null)
    .map((item) => ({
      id: typeof item.id === 'string' ? item.id : '',
      desc: typeof item.desc === 'boolean' ? item.desc : false
    }))
    .filter((item) => item.id.length > 0);
}

function normalizePeriodState(value: unknown): VisitorActivityPeriod | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as { fromUtcIso?: unknown; toUtcIso?: unknown };

  if (typeof candidate.fromUtcIso !== 'string' || typeof candidate.toUtcIso !== 'string') {
    return null;
  }

  if (!candidate.fromUtcIso || !candidate.toUtcIso) {
    return null;
  }

  return {
    fromUtcIso: candidate.fromUtcIso,
    toUtcIso: candidate.toUtcIso
  };
}