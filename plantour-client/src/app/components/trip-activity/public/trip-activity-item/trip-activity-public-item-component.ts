import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { formatDate } from '../../../../helpers/utils';
import { AmazonLinkComponent } from '../../../amazon-link/amazon-link-component';
import { TripActivityDto } from '../../../../services/trip-activity-service';

@Component({
  selector: 'app-trip-activity-public-item',
  imports: [FormsModule, Select, AmazonLinkComponent],
  templateUrl: './trip-activity-public-item-component.html',
  styleUrl: './trip-activity-public-item-component.scss',
})
export class TripActivityPublicItemComponent {
  @Input() entity: TripActivityDto = {} as TripActivityDto;
  @Input() itemMetaData: any | null = null;

  get scheduleText(): string | null {
    if (this.entity.startDate && this.entity.endDate) {
      return `${formatDate(this.entity.startDate)} - ${formatDate(this.entity.endDate)}`;
    }

    return null;
  }

  onItineraryPartChange(id: string | null) {
    if (!this.itemMetaData?.assignItineraryPart || this.itemMetaData?.isReadOnly?.()) {
      return;
    }

    this.itemMetaData.assignItineraryPart(this.entity, id);
  }

  onItineraryPartClick(event: Event) {
    event.stopPropagation();
  }
}