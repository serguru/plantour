import { Component, Input } from '@angular/core';
import { TripThingDto } from '../../../services/trip-thing-service';

@Component({
  selector: 'app-trip-thing-item-component',
  imports: [],
  templateUrl: './trip-thing-item-component.html',
  styleUrl: './trip-thing-item-component.scss',
})
export class TripThingItemComponent {
  @Input() item: TripThingDto = {} as TripThingDto;

}
