import { Component, inject } from '@angular/core';
import { CrudService } from '../../services/crud-service';
import { CreateUserThingRequest, UpdateUserThingRequest, UserThingDto, UserThingService } from '../../services/user-thing-service';
import { BaseListComponent } from '../base-list/base-list';
import { Router } from '@angular/router';

@Component({
  selector: 'app-things-component',
  imports: [
    BaseListComponent
  ],
  templateUrl: './things-component.html',
  styleUrl: './things-component.scss',
})
export class ThingsComponent {
  router = inject(Router);

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

  toolBarButtons =
    [
      {
        id: 'back-button',
        icon: 'pi pi-chevron-left',
        tooltip: 'Back',
        command: () => this.router.navigate([""])
      }
    ]

}
