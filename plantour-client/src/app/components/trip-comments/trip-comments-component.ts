import { Component } from '@angular/core';
import { EntitiesComponent } from '../entities/entities-component';

@Component({
  selector: 'app-trip-comments',
  imports: [
    EntitiesComponent
  ],
  templateUrl: './trip-comments-component.html',
  styleUrl: './trip-comments-component.scss',
})
export class TripCommentsComponent {
  componentId: string = 'trip-comments';
}
