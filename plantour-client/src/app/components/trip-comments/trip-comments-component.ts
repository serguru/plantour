import { Component, inject } from '@angular/core';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesService } from '../../services/entities-service';
import { PlButtonComponent } from "../button/button-component";
import { TripItemCommentComponent } from './trip-item-comment/trip-item-comment-component';
import { EntitiesHeaderComponent } from '../entities/entities-header-component/entities-header-component';
import { toSignal } from '@angular/core/rxjs-interop';
import { Condition, DynamicQueryService } from '../../services/dynamic-query-service';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';

@Component({
  selector: 'app-trip-comments',
  imports: [
    EntitiesComponent,
    EntitiesHeaderComponent,
    EntitiesActionsComponent
  ],
  templateUrl: './trip-comments-component.html',
  styleUrl: './trip-comments-component.scss',
})
export class TripCommentsComponent {
  componentId: string = 'trip-comments';
  tripItemCommentComponent = TripItemCommentComponent;

  entitiesService = inject(EntitiesService);

  dynamicQueryService = inject(DynamicQueryService);

  actions = toSignal(this.entitiesService.actions$, { initialValue: null });

  conditions: Condition[] =
    [
      {
        kind: 'sort',
        property: 'name',
        sortType: 'text',
        direction: 'asc'
      },
      {
        kind: 'filter',
        property: 'name',
        label: 'Name',
        filterText: 'eat',
        comparisonType: 'contains'
      }
    ];

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


    // this.dynamicQueryService.setConditions([
    //   {
    //     kind: 'sort', 
    //     property: 'name',
    //     sortType: 'text', 
    //     direction: 'asc'
    //   },
    //   {
    //     kind: 'filter', 
    //     property: 'name',
    //     label: 'Name',
    //     filterText: 'eat', 
    //     comparisonType: 'contains'
    //   }
    // ]);
  }

  delete(id: string): void {
    console.log('Delete comment with id:', id);
  }
}


