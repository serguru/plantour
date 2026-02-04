import { Component, inject, Input } from '@angular/core';
import { UsersService } from '../../../services/users-service';
import { TripCommentDto } from '../../../services/trip-comment-service';

@Component({
  selector: 'app-trip-item-comment',
  imports: [],
  templateUrl: './trip-item-comment-component.html',
  styleUrl: './trip-item-comment-component.scss',
})
export class TripItemCommentComponent {
  @Input() entity!: TripCommentDto;

  usersService = inject(UsersService);

  // get isMyMessage(): boolean {
  //   const currentUserId = this.usersService.getCurrentUserId();
  //   return this.entity?.userId === currentUserId;
  // }


}
