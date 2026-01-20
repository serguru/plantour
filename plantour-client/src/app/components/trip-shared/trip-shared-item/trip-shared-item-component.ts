import { Component, computed, inject, Input } from '@angular/core';
import { AssignmentStatus, TripSharedDto } from '../../../services/trip-shared-service';
import { Select } from 'primeng/select';
import { ComponentService } from '../../../services/component-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { FormatDatePipe } from '../../../pipes/format-date.pipe';
import { formatDate, getDaysDifference } from '../../../helpers/utils';
import { UsersService } from '../../../services/users-service';



@Component({
  selector: 'app-trip-shared-item-component',
  imports: [
    Select,
    FormsModule,
    Checkbox
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

  accepted = false;
  rejected = false;

  get statusToClassMap() {
    switch (this.entity.assignmentStatus) {
      case AssignmentStatus.NotAssigned:
        return 'not-assigned';
      case AssignmentStatus.AssignedNotFinished:
        return 'assigned-not-finished';
      case AssignmentStatus.FinishedSuccess:
        return 'finished-success';
      case AssignmentStatus.FinishedFailure:
        return 'finished-failure';
      default:
        return '';
    }
  };


  componentService = inject(ComponentService);
  targetCondition = toSignal(this.componentService.targetCondition$, { initialValue: null });
  isAdminSignal = inject(UsersService).isAdminSignal;

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