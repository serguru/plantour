import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Checkbox, CheckboxChangeEvent } from 'primeng/checkbox';
import { Select } from 'primeng/select';
import { formatDate, mapStatusToClass } from '../../../helpers/utils';
import { AmazonLinkComponent } from '../../amazon-link/amazon-link-component';
import { TripTodoDto } from '../../../services/trip-todo-service';

@Component({
  selector: 'app-trip-todo-item-component',
  imports: [Checkbox, FormsModule, Select, AmazonLinkComponent],
  templateUrl: './trip-todo-item-component.html',
  styleUrl: './trip-todo-item-component.scss',
})
export class TripTodoItemComponent {
  @Input() entity: TripTodoDto = {} as TripTodoDto;
  @Input() itemMetaData: any | null = null;

  get assigned() {
    return !!this.entity.tripSharedTodoId;
  }

  get statusToClassMap() {
    return mapStatusToClass(this.entity.assignmentStatus || null);
  }

  get scheduleText(): string | null {
    if (this.entity.startDate && this.entity.endDate) {
      return `${formatDate(this.entity.startDate)} - ${formatDate(this.entity.endDate)}`;
    }

    return null;
  }

  handleFinishedSuccessClick(event: CheckboxChangeEvent) {
    event.originalEvent!.preventDefault();
    event.originalEvent!.stopPropagation();
    this.entity.finished = event.checked ? 'success' : null;
    this.itemMetaData.toggleFinished(this.entity);
  }

  handleFinishedFailureClick(event: CheckboxChangeEvent) {
    event.originalEvent!.preventDefault();
    event.originalEvent!.stopPropagation();
    this.entity.finished = event.checked ? 'failure' : null;
    this.itemMetaData.toggleFinished(this.entity);
  }

  onItineraryPartChange(id: string | null) {
    if (!this.itemMetaData?.assignItineraryPart) {
      return;
    }

    this.itemMetaData.assignItineraryPart(this.entity, id);
  }

  onItineraryPartClick(event: Event) {
    event.stopPropagation();
  }
}