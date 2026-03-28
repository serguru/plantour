import { Component, Input } from '@angular/core';
import { ItineraryPartDto } from '../../../services/itinerary-service';
import { formatDate } from '../../../helpers/utils';

@Component({
  selector: 'app-trip-itinerary-item-component',
  standalone: true,
  templateUrl: './trip-itinerary-item-component.html',
  styleUrl: './trip-itinerary-item-component.scss',
})
export class TripItineraryItemComponent {
  @Input() entity: ItineraryPartDto = {} as ItineraryPartDto;

  get scheduleText(): string | null {
    if (!this.entity.startDate && !this.entity.endDate) {
      return null;
    }

    if (this.entity.startDate && this.entity.endDate) {
      return `${formatDate(this.entity.startDate)} - ${formatDate(this.entity.endDate)}`;
    }

    return formatDate(this.entity.startDate || this.entity.endDate || '');
  }
}