import { Component, inject } from '@angular/core';
import { CrudService } from '../../services/crud-service';
import { CreateUserThingRequest, UpdateUserThingRequest, UserThingDto, UserThingService } from '../../services/user-thing-service';
import { BaseListComponent } from '../base-list/base-list';

@Component({
  selector: 'app-things-component',
  imports: [
    BaseListComponent
  ],
  templateUrl: './things-component.html',
  styleUrl: './things-component.scss',
})
export class ThingsComponent {
  service: CrudService<UserThingDto, CreateUserThingRequest, UpdateUserThingRequest> = inject(UserThingService);

  // Configuration
  configuration: any[] = [
    {
      property: 'name',
      icon: 'pi pi-box',
      config: {
        lookup: false,
        filter: true,
        sorting: 'text'
      }
    }
  ];
}
