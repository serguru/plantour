import { Component, inject, Input } from '@angular/core';
import { TripThingDto } from '../../../services/trip-thing-service';
import { TripPackageDto } from '../../../services/trip-package-service';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { MultipleIdsRequest } from '../../../services/crud-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ComponentService } from '../../../services/component-service';

@Component({
  selector: 'app-trip-thing-item-component',
  imports: [
    Select,
    FormsModule
  ],
  templateUrl: './trip-thing-item-component.html',
  styleUrl: './trip-thing-item-component.scss',
})
export class TripThingItemComponent {
  @Input() entity: TripThingDto = {} as TripThingDto;
  @Input() itemMetaData: any | null = null;


  componentService = inject(ComponentService);
  targetCondition = toSignal(this.componentService.targetCondition$, { initialValue: null });


  onPackChange(id: string | null) {
    if (!this.itemMetaData?.packOrUnpack) {
      return;
    }
    this.itemMetaData.packOrUnpack(this.entity, id, true);
  }

  onPackClick(event) {
    event.stopPropagation();
  }
}
