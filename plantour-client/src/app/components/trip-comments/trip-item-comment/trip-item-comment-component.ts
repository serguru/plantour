import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-trip-item-comment-component',
  imports: [],
  templateUrl: './trip-item-comment-component.html',
  styleUrl: './trip-item-comment-component.scss',
})
export class TripItemCommentComponent {
  @Input() entity: any;

}
