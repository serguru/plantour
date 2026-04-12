import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { HlmInput } from '../../ui/input/src/lib/hlm-input';

export interface DataTableTopPanelGroupingOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-data-table-top-panel',
  imports: [HlmInput],
  templateUrl: './data-table-top-panel.html',
  styleUrl: './data-table-top-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableTopPanelComponent {
  readonly isLoading = input(false);
  readonly periodLabel = input.required<string>();
  readonly durationLabel = input.required<string>();
  readonly filterId = input.required<string>();
  readonly filterLabel = input.required<string>();
  readonly filterPlaceholder = input.required<string>();
  readonly filterValue = input('');
  readonly groupingId = input.required<string>();
  readonly groupingLabel = input.required<string>();
  readonly groupingValue = input.required<string>();
  readonly groupingOptions = input.required<readonly DataTableTopPanelGroupingOption[]>();

  readonly periodClick = output<void>();
  readonly filterChange = output<Event>();
  readonly groupingChange = output<Event>();

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
}