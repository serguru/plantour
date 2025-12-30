import { Component, Input } from '@angular/core';
import { TripUserDto } from '../../../services/trip-user-service';

@Component({
  selector: 'app-trip-participant-item-component',
  imports: [],
  templateUrl: './trip-user-item-component.html',
  styleUrl: './trip-user-item-component.scss',
})
export class TripUserItemComponent {
  @Input() item: TripUserDto = {} as TripUserDto;
  get mainInfo(): string {

    if (!this.item.firstName && !this.item.lastName) {
      return this.item.email;
    }
    return `${this.item.firstName} ${this.item.lastName}`;
  }

}
