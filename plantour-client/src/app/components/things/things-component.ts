import { Component, inject } from '@angular/core';
import { CrudService } from '../../services/crud-service';
import { CreateUserThingRequest, UpdateUserThingRequest, UserThingDto, UserThingService } from '../../services/thing-service';
import { BaseListComponent } from '../base-list/base-list';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';

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

  service: CrudService<UserThingDto, CreateUserThingRequest, UpdateUserThingRequest> = inject(UserThingService);

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

  onCategoryClick(item: UserThingDto, $event: Event) {
     $event.stopPropagation(); 
     console.log('Category: ' + item.category);
  }

   

}
