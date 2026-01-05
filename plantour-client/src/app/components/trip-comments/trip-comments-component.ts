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
      { id: '9f3c2c3d-6e8f-4f7d-9a4a-8c5b1b4d2e91', name: 'Great trip!', color: 'blue' },
      { id: '4a1b7e62-0d9c-4e3f-8f21-3c6b9a2e5d44', name: 'Нужно собираться быстрее', color: 'red' },
      { id: 'c8e5a2f9-3b4d-4a7c-b6e1-0f9d2a8c7b53', name: 'Захватите кто-нибудь лимонную кислоту', color: 'green' },
    ])
  }

  delete(id: string): void {
    console.log('Delete comment with id:', id);
  }

}


