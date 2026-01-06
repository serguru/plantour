import { Component, inject } from '@angular/core';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesService } from '../../services/entities-service';
import { TripItemCommentComponent } from './trip-item-comment/trip-item-comment-component';
import { EntitiesHeaderComponent } from '../entities/entities-header-component/entities-header-component';
import { Condition, FilterComparisonType } from '../../services/dynamic-query-service';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { TripService } from '../../services/trip-service';
import { switchMap, tap } from 'rxjs';
import { PackageService } from '../../services/package-service';

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
  settingsPersistenceService = inject(EntitiesService).settingsPersistenceService;
  dynamicQueryService = inject(EntitiesService).dynamicQueryService;
  tripService = inject(TripService);
  packageService = inject(PackageService)


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
        property: 'name',
        label: 'Name',
        filterText: '',
        comparisonType: 'contains',
        icon: 'box'
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


    this.entitiesService.updateTargetLookup([
      { id: '7f3a1b8c-5d2e-4a9f-8b3c-1d0e9f8a7b6c', name: 'Alice' },
      { id: 'a2d4c6e8-b0f1-4d2a-9c3e-5f7a9b1c3d5e', name: 'Bob' },
      { id: 'e9b8d7c6-a5f4-4321-b0a9-876543210fed', name: 'Charlie' }
    ]);

  }

  delete(id: string): void {
    console.log('Delete comment with id:', id);
  }

}


