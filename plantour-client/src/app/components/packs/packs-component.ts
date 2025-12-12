import { Component, inject } from '@angular/core';
import { CrudService } from '../../services/crud-service';
import { CreateUserPackageRequest, UpdateUserPackageRequest, UserPackageDto, UserPackageService } from '../../services/user-package-service';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseListComponent } from '../base-list/base-list';


@Component({
  selector: 'app-packs',
  imports: [
    BaseListComponent
  ],
  templateUrl: './packs-component.html',
  styleUrl: './packs-component.scss',
})
export class PacksComponent {

  router = inject(Router);

  service: CrudService<UserPackageDto, CreateUserPackageRequest, UpdateUserPackageRequest> = inject(UserPackageService);

  // Configuration
  configuration: any[] = [
    {
      property: 'name',
      icon: 'pi pi-user',
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
