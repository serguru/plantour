import { Component, inject, OnInit } from '@angular/core';
import { CrudService, FromDicService } from '../../services/crud-service';
import { TripPackageDto, CreateTripPackageRequest, UpdateTripPackageRequest, TripPackageService } from '../../services/trip-package-service';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseListComponent } from '../base-list/base-list';
import { UpperActionType } from '../../helpers/enums';


@Component({
  selector: 'app-trip-packs',
  standalone: true,
  imports: [
    BaseListComponent
  ],
  templateUrl: './trip-packs-component.html',
  styleUrl: './trip-packs-component.scss',
})
export class TripPacksComponent implements OnInit {
  componentId: string = 'trip-packs';
  public ActionType = UpperActionType;

  tripId: string | null = null;

  ngOnInit(): void {
    this.tripId = this.route.snapshot.paramMap.get('tripId');
  }

  route = inject(ActivatedRoute);
  router = inject(Router);
  service: CrudService<TripPackageDto, CreateTripPackageRequest, UpdateTripPackageRequest> = inject(TripPackageService);

  fromDicservice:FromDicService = inject(TripPackageService);

  configuration: any[] = [
    {
      property: 'name',
      label: 'Name',
      icon: 'pi pi-box',
      config: {
        lookupIcon: 'pi pi-box',
        filter: true,
        sorting: 'text'
      }
    }
  ];


}
