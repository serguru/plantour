import { Component, inject, OnInit } from '@angular/core';
import { CrudService, FromDicService, PackingService } from '../../services/crud-service';
import { TripThingDto, CreateTripThingRequest, UpdateTripThingRequest, TripThingService } from '../../services/trip-thing-service';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseListComponent } from '../base-list/base-list';
import { TripPackageDto } from '../../services/trip-package-service';
import { Select } from "primeng/select";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UpperActionType } from '../../helpers/enums';

@Component({
  selector: 'app-trip-things',
  standalone: true,
  imports: [
    BaseListComponent,
    Select,
    FormsModule,
    CommonModule
],
  templateUrl: './trip-things-component.html',
  styleUrl: './trip-things-component.scss',
})
export class TripThingsComponent implements OnInit {
  componentId: string = 'trip-things';
  public ActionType = UpperActionType;

  tripId: string | null = null;
  route = inject(ActivatedRoute);
  router = inject(Router);
  service: CrudService<TripThingDto, CreateTripThingRequest, UpdateTripThingRequest> = inject(TripThingService);

  fromDicservice: FromDicService = inject(TripThingService);
  packingService: PackingService = inject(TripThingService);

  checkSelectedPack: (() => TripPackageDto | null) | null = null;

  setCheckSelectedPack(getter: (() => TripPackageDto | null) | null) {
    this.checkSelectedPack = getter;
  }

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

  ngOnInit(): void {
    this.tripId = this.route.snapshot.paramMap.get('tripId');
  }
}
