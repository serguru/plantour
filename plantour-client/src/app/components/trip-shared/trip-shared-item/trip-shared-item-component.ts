import { Component, Input } from '@angular/core';
import { TripSharedDto } from '../../../services/trip-shared-service';

@Component({
  selector: 'app-trip-shared-item-component',
  imports: [],
  templateUrl: './trip-shared-item-component.html',
  styleUrl: './trip-shared-item-component.scss',
})
export class TripSharedItemComponent {
  @Input() item: TripSharedDto = {} as TripSharedDto;

}
