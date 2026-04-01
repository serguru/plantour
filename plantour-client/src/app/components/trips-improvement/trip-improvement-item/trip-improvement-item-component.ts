import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { Checkbox, CheckboxChangeEvent } from 'primeng/checkbox';
import { TripImprovementDto } from '../../../services/trip-improvement-service';

@Component({
  selector: 'app-trip-improvement-item-component',
  imports: [Checkbox, FormsModule, BadgeModule],
  templateUrl: './trip-improvement-item-component.html',
  styleUrl: './trip-improvement-item-component.scss',
})
export class TripImprovementItemComponent {
  @Input() entity: TripImprovementDto = {} as TripImprovementDto;
  @Input() itemMetaData: any | null = null;

  get orderBadgeValue(): string {
    return `${this.entity.improvementOrder ?? ''}`;
  }

  isExpanded(): boolean {
    return !!this.itemMetaData?.isExpanded?.(this.entity.id);
  }

  onExpandedToggle(event: Event): void {
    const details = event.target as HTMLDetailsElement | null;
    if (!details) {
      return;
    }

    this.itemMetaData?.toggleExpanded?.(this.entity.id, details.open);
  }

  handleAcceptedClick(event: CheckboxChangeEvent) {
    event.originalEvent!.preventDefault();
    event.originalEvent!.stopPropagation();
    this.entity.finished = event.checked ? 'success' : null;
    this.itemMetaData.toggleFinished(this.entity);
  }

  handleRejectedClick(event: CheckboxChangeEvent) {
    event.originalEvent!.preventDefault();
    event.originalEvent!.stopPropagation();
    this.entity.finished = event.checked ? 'failure' : null;
    this.itemMetaData.toggleFinished(this.entity);
  }
}