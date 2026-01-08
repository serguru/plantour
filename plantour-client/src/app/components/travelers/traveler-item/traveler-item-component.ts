import { Component, Input } from '@angular/core';
import { AdminsParticipantDto } from '../../../services/admins-participant-service';

@Component({
  selector: 'app-traveler-item-component',
  imports: [],
  templateUrl: './traveler-item-component.html',
  styleUrl: './traveler-item-component.scss',
})
export class TravelerItemComponent {
  @Input() entity: AdminsParticipantDto = {} as AdminsParticipantDto;

  get fullName(): string {
    return `${this.entity.firstName ? (this.entity.firstName + ' ') : ''}${this.entity.lastName}`;
  }

}
