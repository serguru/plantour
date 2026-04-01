import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Checkbox, CheckboxChangeEvent } from 'primeng/checkbox';
import { TripImprovementDto } from '../../../services/trip-improvement-service';
import { AmazonLinkComponent } from '../../amazon-link/amazon-link-component';

@Component({
  selector: 'app-trip-improvement-item-component',
  imports: [Checkbox, FormsModule, AmazonLinkComponent],
  templateUrl: './trip-improvement-item-component.html',
  styleUrl: './trip-improvement-item-component.scss',
})
export class TripImprovementItemComponent {
  @Input() entity: TripImprovementDto = {} as TripImprovementDto;
  @Input() itemMetaData: any | null = null;

  handleAcceptedClick(event: CheckboxChangeEvent) {
    event.originalEvent!.preventDefault();
    event.originalEvent!.stopPropagation();
    this.entity.finished = event.checked ? 'success' : null;
    this.itemMetaData.toggleFinished(this.entity);
  }

  handleRejectedClick(event: CheckboxChangeEvent) {
    event.originalEvent!.preventDefault();
    event.originalEvent!.stopPropagation();
    this.entity.finished = event.checked ? 'failure' : null;
    this.itemMetaData.toggleFinished(this.entity);
  }
}