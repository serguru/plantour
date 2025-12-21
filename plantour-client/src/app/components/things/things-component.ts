import { Component, inject } from '@angular/core';
import { CrudService, FromDicService } from '../../services/crud-service';
import { CreateThingRequest, UpdateThingRequest, ThingDto, ThingService } from '../../services/thing-service';
import { BaseListComponent } from '../base-list/base-list';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { CreateTripThingRequest, TripThingService, TripThingDto, UpdateTripThingRequest } from '../../services/trip-thing-service';
import { UpperActionType } from '../../services/enums';

@Component({
  selector: 'app-things-component',
  imports: [
    BaseListComponent,
    TagModule
  ],
  templateUrl: './things-component.html',
  styleUrl: './things-component.scss',
})
export class ThingsComponent {
  router = inject(Router);
  public ActionType = UpperActionType;

  service: CrudService<ThingDto, CreateThingRequest, UpdateThingRequest> = inject(ThingService);
  tripDicService: CrudService<TripThingDto, CreateTripThingRequest, UpdateTripThingRequest> = inject(TripThingService);
  fromDicService: FromDicService = inject(TripThingService);

  configuration: any[] = [
    {
      property: 'name',
      label: 'Name',
      config: {
        filter: true,
        sorting: 'text'
      }
    },{
      property: 'category',
      label: 'Category',
      config: {
        filter: true,
        sorting: 'text',
        lookupIcon: 'pi pi-objects-column'
      }
    }
  ];

  toolBarButtons =
    [
      {
        id: 'back-button',
        icon: 'pi pi-chevron-left',
        tooltip: 'Back',
        command: () => this.router.navigate([""])
      }
    ]

  onCategoryClick(item: ThingDto, $event: Event) {
     $event.stopPropagation(); 
     console.log('Category: ' + item.category);
  }

   

}
