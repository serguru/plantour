import { Component, Input } from '@angular/core';
import { TripUserDto } from '../../../services/trip-user-service';

@Component({
  selector: 'app-trip-participant-item-component',
  imports: [],
  templateUrl: './trip-user-item-component.html',
  styleUrl: './trip-user-item-component.scss',
})
export class TripUserItemComponent {
  @Input() entity: TripUserDto = {} as TripUserDto;

}
