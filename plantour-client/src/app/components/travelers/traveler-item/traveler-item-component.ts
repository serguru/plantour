import { Component, Input } from '@angular/core';
import { AdminsParticipantDto } from '../../../services/admins-participant-service';

@Component({
  selector: 'app-traveler-item-component',
  imports: [],
  templateUrl: './traveler-item-component.html',
  styleUrl: './traveler-item-component.scss',
})
export class TravelerItemComponent {
  @Input() item: AdminsParticipantDto = {} as AdminsParticipantDto;

  get mainInfo(): string {

    if (!this.item.firstName && !this.item.lastName) {
      return this.item.email;
    }
    return `${this.item.firstName} ${this.item.lastName}`;
  }

}
