import { Component, Input } from '@angular/core';
import { TripDto } from '../../../services/trip-service';

@Component({
  selector: 'app-trip-item-component',
  imports: [],
  templateUrl: './trip-item-component.html',
  styleUrl: './trip-item-component.scss',
})
export class TripItemComponent {

  @Input() entity: TripDto = {} as TripDto;
  
}
