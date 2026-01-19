import { Component, computed, inject, Input } from '@angular/core';
import { TripSharedDto } from '../../../services/trip-shared-service';
import { Select } from 'primeng/select';
import { ComponentService } from '../../../services/component-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { FormatDatePipe } from '../../../pipes/format-date.pipe';
import { getDaysDifference } from '../../../helpers/utils';

@Component({
  selector: 'app-trip-shared-item-component',
  imports: [
    Select,
    FormsModule,
    Checkbox,
    FormatDatePipe
  ],
  templateUrl: './trip-shared-item-component.html',
  styleUrl: './trip-shared-item-component.scss',
})
export class TripSharedItemComponent {
  @Input() entity: TripSharedDto = {} as TripSharedDto;
  @Input() itemMetaData: any | null = null;

  handleAcceptedClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.accepted = !this.accepted;
  }

  handleRejectedClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.rejected = !this.rejected;
  }
 
    // assigneesVisible: this.assigneesVisible(),
    // assignmentsVisible: this.assignmentsVisible()

  get days(): string {

    const daysDifference = getDaysDifference(this.entity.assignedDeadline, this.entity.assignedAt);
    if (daysDifference === null) {
      return '';
    }

    if (daysDifference > 0) {
      return `Days left: ${daysDifference}`;
    } else if (daysDifference < 0) {
      return `Days overdue: ${Math.abs(daysDifference)}`;
    } else {
      return 'Due today';
    }
  }

  accepted = false;
  rejected = false;

  componentService = inject(ComponentService);
  targetCondition = toSignal(this.componentService.targetCondition$, { initialValue: null });

  selectedId = toSignal(this.componentService.selectedId$, { initialValue: null });

  
  onAssigneeChange(id: string | null) {
    if (!this.itemMetaData?.assignOrUnassign) {
      return;
    }
    this.itemMetaData.assignOrUnassign(this.entity, id, true);
  }

  onAssigneeClick(event) {
    event.stopPropagation();
  }
}