import { Component, inject, OnInit } from '@angular/core';
import { CrudService, FromDicService } from '../../services/crud-service';
import { TripSharedDto, CreateTripSharedRequest, UpdateTripSharedRequest, TripSharedService } from '../../services/trip-shared-service';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseListComponent } from '../base-list/base-list';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UpperActionType } from '../../helpers/enums';
import { TripSharedItemComponent } from './trip-shared-item/trip-shared-item-component';

@Component({
  selector: 'app-trip-shared',
  standalone: true,
  imports: [
    BaseListComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './trip-shared-component.html',
  styleUrl: './trip-shared-component.scss'
})
export class TripSharedComponent implements OnInit {
  tripSharedItemComponent = TripSharedItemComponent;
componentId: string = 'trip-shared';
public ActionType = UpperActionType;

  tripId: string | null = null;
  route = inject(ActivatedRoute);
  router = inject(Router);
  service: CrudService<TripSharedDto, CreateTripSharedRequest, UpdateTripSharedRequest> = inject(TripSharedService);
  fromDicservice: FromDicService = inject(TripSharedService);

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
