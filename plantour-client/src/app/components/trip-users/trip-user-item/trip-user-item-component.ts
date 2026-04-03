import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Checkbox, CheckboxChangeEvent } from 'primeng/checkbox';
import { TripUserDto } from '../../../services/trip-user-service';
import { capitalizeFirstLetter, isNumber, mapStatusToClass } from '../../../helpers/utils';

@Component({
  selector: 'app-trip-participant-item-component',
  imports: [FormsModule, Checkbox],
  templateUrl: './trip-user-item-component.html',
  styleUrl: './trip-user-item-component.scss',
})
export class TripUserItemComponent {
  @Input() entity: TripUserDto = {} as TripUserDto;
  @Input() itemMetaData: any | null = null;

  get statusToClassMap() {
    return mapStatusToClass(this.entity.sharedAssignmentStatus || null);
  }

  get lowerText(): string {

    const array: string[] = [];

    if (this.entity.phone) {
      array.push(`phone: ${this.entity.phone}`);
    }

    if (typeof this.entity.packagingComplete === 'boolean') {
      array.push(`packaging: ${this.entity.packagingComplete ? 'complete' : 'not complete'}`);
    }

    const noPackWeightText = this.noPackWeightText;
    if (noPackWeightText) {
      array.push(noPackWeightText);
    }

    array.push(`bags: ${this.entity.totalPacks}`);
    array.push(`items: ${this.entity.totalThings}`);
    array.push(`shared items: ${this.entity.totalSharedThings}`);
    array.push(`shared assigned: ${this.entity.sharedAmount ?? 0}`);
    array.push(`shared paid: ${this.entity.sharedPaidAmount ?? 0}`);
    array.push(`shared remaining: ${this.entity.sharedRemainingAmount ?? 0}`);

    if (array.length == 0) {
      return '';
    }
    array[0] = capitalizeFirstLetter(array[0]);
    const result = array.join(', ');
    return result;
  }

  get noPackWeightText(): string {
    const value = this.entity.nopackWeightValue;
    const unit = this.entity.nopackWeightUnit;
    if (isNumber(value) && unit && unit.trim().length > 0) {
      return `no-pack weight: ${value} ${unit.trim()}`;
    }
    return '';
  }

  get marked(): boolean {
    return !!this.itemMetaData?.isMarked?.(this.entity.id);
  }

  get canEditRejected(): boolean {
    return !!this.entity.currentUserCanManageSharedAssignment;
  }

  get showRejectedText(): boolean {
    return !this.canEditRejected && !!this.entity.rejected;
  }

  get showEditableAssignmentStatusText(): boolean {
    return this.canEditRejected && !this.entity.rejected && !!this.entity.sharedAssignmentStatusText;
  }

  onRejectedChange(event: CheckboxChangeEvent): void {
    event.originalEvent?.preventDefault();
    event.originalEvent?.stopPropagation();
    this.itemMetaData?.toggleRejectSharedAssignment?.(this.entity);
  }

  onRejectedClick(event: Event): void {
    event.stopPropagation();
  }

  onMarkedChange(event: CheckboxChangeEvent): void {
    event.originalEvent?.stopPropagation();
    this.itemMetaData?.toggleMarked?.(this.entity.id, !!event.checked);
  }

  onMarkedClick(event: Event): void {
    event.stopPropagation();
  }

}
