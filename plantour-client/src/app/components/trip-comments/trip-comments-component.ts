import { Component, inject } from '@angular/core';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesService } from '../../services/entities-service';
import { TripItemCommentComponent } from './trip-item-comment/trip-item-comment-component';
import { EntitiesHeaderComponent } from '../entities/entities-header-component/entities-header-component';
import { Condition } from '../../services/dynamic-query-service';
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


  constructor() {
  }

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
        property: 'id',
        label: 'ID',
        filterText: '',
        comparisonType: 'exact'
      },
      {
        kind: 'filter',
        property: 'color',
        label: 'Color',
        filterText: '',
        comparisonType: 'exact'
      },
      {
        kind: 'filter',
        property: 'name',
        label: 'Name',
        filterText: '',
        comparisonType: 'contains'
      }
    ];


  ngOnInit(): void {

    this.entitiesService.updateComponentInit(
      {
        componentId: this.componentId,
        initialConditions: this.conditions
      }
    );


    this.entitiesService.updateEntities([
      { id: 'a', name: 'Great trip!', color: 'blue' },
      { id: 'b', name: 'Нужно собираться быстрее', color: 'red' },
      { id: 'c', name: 'Захватите кто-нибудь лимонную кислоту', color: 'green' },
    ])
  }

  delete(id: string): void {
    console.log('Delete comment with id:', id);
  }

  send() : void {
    this.entitiesService.updateEntities([
      { id: 'a', name: 'Great trip!', color: 'blue' },
      { id: 'b', name: 'Нужно собираться быстрее', color: 'red' },
      { id: 'c', name: 'Захватите кто-нибудь лимонную кислоту', color: 'green' },
      { id: 'd', name: 'Great trip!', color: 'blue' },
      { id: 'e', name: 'Нужно собираться быстрее', color: 'red' },
      { id: 'f', name: 'Захватите кто-нибудь лимонную кислоту', color: 'green' },
    ])
    
  }
}


