import { Component, inject } from '@angular/core';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesService } from '../../services/entities-service';
import { PlButtonComponent } from "../button/button-component";
import { TripItemCommentComponent } from './trip-item-comment/trip-item-comment-component';

@Component({
  selector: 'app-trip-comments',
  imports: [
    EntitiesComponent,
   
],
  templateUrl: './trip-comments-component.html',
  styleUrl: './trip-comments-component.scss',
})
export class TripCommentsComponent {
  componentId: string = 'trip-comments';
  tripItemCommentComponent = TripItemCommentComponent;

  entitiesService = inject(EntitiesService);

  ngOnInit(): void {
    this.entitiesService.updateEntities([
      { id: 'a', name: 'Great trip!' },
      { id: 'b', name: 'Нужно собираться быстрее' },
      { id: 'c', name: 'Захватите кто-нибудь лимонную кислоту' },
    ])
  }

}


