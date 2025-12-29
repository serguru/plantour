import { Component, inject } from '@angular/core';
import { CrudService, FromDicService } from '../../services/crud-service';
import { CreatePackageRequest, UpdatePackageRequest, PackageDto, UserPackageService } from '../../services/package-service';
import { Router } from '@angular/router';
import { BaseListComponent } from '../base-list/base-list';
import { CreateTripPackageRequest, TripPackageDto, TripPackageService, UpdateTripPackageRequest } from '../../services/trip-package-service';
import { UpperActionType } from '../../helpers/enums';
import { PackItemComponent } from './pack-item/pack-item-component/pack-item-component';

@Component({
  selector: 'app-packs',
  imports: [
    BaseListComponent
],
  templateUrl: './packs-component.html',
  styleUrl: './packs-component.scss',
})
export class PacksComponent {

  packItemComponent = PackItemComponent;

  componentId: string = 'packs';

  public ActionType = UpperActionType;

  router = inject(Router);

  service: CrudService<PackageDto, CreatePackageRequest, UpdatePackageRequest> = inject(UserPackageService);

  tripDicService: CrudService<TripPackageDto, CreateTripPackageRequest, UpdateTripPackageRequest> = inject(TripPackageService);

  fromDicService: FromDicService = inject(TripPackageService);

  configuration: any[] = [
    {
      property: 'name',
      label: 'Name',
      icon: 'pi pi-user',
      config: {
        lookupIcon: 'pi pi-box',
        filter: true,
        sorting: 'text'
      }
    }
  ];

}
