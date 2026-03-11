import { Component, computed, inject, Input } from '@angular/core';
import { TripSharedDto } from '../../../services/trip-shared-service';
import { Select } from 'primeng/select';
import { ComponentService } from '../../../services/component-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { mapStatusToClass } from '../../../helpers/utils';
import { UsersService } from '../../../services/users-service';
import { AssignmentStatus } from '../../../helpers/enums';
import { ThingTextPipe } from '../../../pipes/thing-text.pipe';

@Component({
  selector: 'app-trip-shared-item-component',
  imports: [
    Select,
    FormsModule,
    Checkbox,
    ThingTextPipe
  ],
  templateUrl: './trip-shared-item-component.html',
  styleUrl: './trip-shared-item-component.scss',
})
export class TripSharedItemComponent {
  @Input() entity: TripSharedDto = {} as TripSharedDto;
  @Input() itemMetaData: any | null = null;

  usersService = inject(UsersService);

  isAdminSignal = this.usersService.isAdminSignal;
  isParticipantSignal = this.usersService.isParticipantSignal;


  handleAcceptedClick(event: Event) {
    if (this.isAdminSignal()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.itemMetaData.toggleAccept(this.entity);
  }

  handleRejectedClick(event: Event) {
    if (this.isAdminSignal()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.itemMetaData.toggleReject(this.entity);
  }


  get statusToClassMap() {
    return mapStatusToClass(this.entity.assignmentStatus || null);
  }

  componentService = inject(ComponentService);
  targetCondition = toSignal(this.componentService.targetCondition$, { initialValue: null });


  selectedId = toSignal(this.componentService.selectedId$, { initialValue: null });

  onAssigneeChange(id: string | null) {
    if (!this.isAdminSignal()) {
      return;
    }
    if (!this.itemMetaData?.assignOrUnassign) {
      return;
    }
    this.itemMetaData.assignOrUnassign(this.entity, id, true);
  }

  onAssigneeClick(event) {
    event.stopPropagation();
  }


}