import { Component, Input } from '@angular/core';
import { TripUserDto } from '../../../services/trip-user-service';
import { capitalizeFirstLetter, isNumber } from '../../../helpers/utils';

@Component({
  selector: 'app-trip-participant-item-component',
  imports: [],
  templateUrl: './trip-user-item-component.html',
  styleUrl: './trip-user-item-component.scss',
})
export class TripUserItemComponent {
  @Input() entity: TripUserDto = {} as TripUserDto;
  @Input() itemMetaData: any | null = null;

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



}
