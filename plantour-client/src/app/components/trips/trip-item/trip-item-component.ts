import { Component, Input } from '@angular/core';
import { TripDto } from '../../../services/trip-service';
import { capitalizeFirstLetter, formatDate, getDaysDifference } from '../../../helpers/utils';

@Component({
  selector: 'app-trip-item-component',
  imports: [],
  templateUrl: './trip-item-component.html',
  styleUrl: './trip-item-component.scss',
})
export class TripItemComponent {

  @Input() entity: TripDto = {} as TripDto;
  @Input() itemMetaData: any | null = null;


  datesText(): string { 
    if (this.entity.startDate && this.entity.endDate) {
      const days = getDaysDifference(this.entity.endDate, this.entity.startDate);
      if (days != null && days >= 0) {
        return `${formatDate(this.entity.startDate)} - ${formatDate(this.entity.endDate)}, ${days + 1} day${days + 1 !== 1 ? 's' : ''}`;
      } else {
        return '';
      }
    } else if (this.entity.startDate) {
      return `from ${new Date(this.entity.startDate).toLocaleDateString()}`;
    } else if (this.entity.endDate) {
      return `until ${new Date(this.entity.endDate).toLocaleDateString()}`;
    } else {
      return '';
    } 
  }

  get lowerText(): string {

    const array: string[] = [];

    const dt = this.datesText();
    if (dt) {
      array.push(dt);
    }

    array.push('participants: ' + this.entity.totalParticipants);
    array.push('packs ' + this.entity.totalPacks);
    //array.push('personal items ' + this.entity.totalThings);
    array.push('shared items ' + this.entity.totalSharedThings);

    if (array.length == 0) {
      return '';
    }
    array[0] = capitalizeFirstLetter(array[0]);
    const result = array.join(', ');
    return result;
  }  
  
}
