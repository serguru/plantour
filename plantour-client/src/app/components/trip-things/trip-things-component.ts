import { Component, inject, OnInit } from '@angular/core';
import { CrudService, FromDicService, PackingService } from '../../services/crud-service';
import { TripThingDto, CreateTripThingRequest, UpdateTripThingRequest, TripThingService } from '../../services/trip-thing-service';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseListComponent } from '../base-list/base-list';
import { TripPackageDto, TripPackageService } from '../../services/trip-package-service';
import { Select } from "primeng/select";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UpperActionType } from '../../helpers/enums';
import { TripThingItemComponent } from './trip-thing-item/trip-thing-item-component';
import { AppService } from '../../services/app-service';
import { MessagesService } from '../../services/messages-service';

@Component({
  selector: 'app-trip-things',
  standalone: true,
  imports: [
    BaseListComponent,
    FormsModule,
    CommonModule
],
  templateUrl: './trip-things-component.html',
  styleUrl: './trip-things-component.scss',
})
export class TripThingsComponent implements OnInit {
  tripThingItemComponent = TripThingItemComponent;  
  appService = inject(AppService);
  messagesService = inject(MessagesService);
  tripPackageService = inject(TripPackageService);
  componentId: string = 'trip-things';
  public ActionType = UpperActionType;

  route = inject(ActivatedRoute);
  router = inject(Router);
  service: CrudService<TripThingDto, CreateTripThingRequest, UpdateTripThingRequest> = inject(TripThingService);

  fromDicservice: FromDicService = inject(TripThingService);
  packingService: PackingService = inject(TripThingService);

  checkSelectedPack: (() => TripPackageDto | null) | null = null;

  setCheckSelectedPack(getter: (() => any | null) | null) {
    this.checkSelectedPack = getter;
  }

  packages: TripPackageDto[] | null = null;

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

    const selectedTrip = this.appService.tripSelectedValue();
    if (!selectedTrip || !selectedTrip.id) {
      throw new Error('No trip selected. TripThingsComponent cannot be initialized without a selected trip.');
    }

    this.tripPackageService.getAll(selectedTrip.id).subscribe(packages => {
      this.packages = packages;
    });

  }
}
