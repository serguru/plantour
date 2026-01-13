import { Component, inject, Input } from '@angular/core';
import { TripSharedDto } from '../../../services/trip-shared-service';
import { Select } from 'primeng/select';
import { ComponentService } from '../../../services/component-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trip-shared-item-component',
  imports: [
    Select,
    FormsModule
  ],
  templateUrl: './trip-shared-item-component.html',
  styleUrl: './trip-shared-item-component.scss',
})
export class TripSharedItemComponent {
  @Input() entity: TripSharedDto = {} as TripSharedDto;
  @Input() itemMetaData: any | null = null;


  componentService = inject(ComponentService);
  targetCondition = toSignal(this.componentService.targetCondition$, { initialValue: null });


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