import { Component, inject } from '@angular/core';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesService } from '../../services/entities-service';
import { PlButtonComponent } from "../button/button-component";
import { TripItemCommentComponent } from './trip-item-comment/trip-item-comment-component';
import { EntitiesHeaderComponent } from '../entities/entities-header-component/entities-header-component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-trip-comments',
  imports: [
    EntitiesComponent,
    EntitiesHeaderComponent
  ],
  templateUrl: './trip-comments-component.html',
  styleUrl: './trip-comments-component.scss',
})
export class TripCommentsComponent {
  componentId: string = 'trip-comments';
  tripItemCommentComponent = TripItemCommentComponent;

  entitiesService = inject(EntitiesService);

  actions = toSignal(this.entitiesService.actions$, { initialValue: null });

  ngOnInit(): void {
    this.entitiesService.updateEntities([
      { id: 'a', name: 'Great trip!' },
      { id: 'b', name: 'Нужно собираться быстрее' },
      { id: 'c', name: 'Захватите кто-нибудь лимонную кислоту' },
    ])

    this.entitiesService.updateActions([
      { type: 'filtering', shown: false },
      { type: 'packing', shown: false },
      { type: 'assigning', shown: false },
    ]);
  }

  delete(id: string): void {
    console.log('Delete comment with id:', id); 
  }
}


