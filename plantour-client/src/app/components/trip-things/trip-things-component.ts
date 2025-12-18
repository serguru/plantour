import { Component, inject, OnInit } from '@angular/core';
import { CrudService, FromDicService } from '../../services/crud-service';
import { TripUserThingDto, CreateTripThingRequest, UpdateTripThingRequest, TripThingService } from '../../services/trip-thing-service';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseListComponent } from '../base-list/base-list';

@Component({
  selector: 'app-trip-things',
  standalone: true,
  imports: [
    BaseListComponent
  ],
  templateUrl: './trip-things-component.html',
  styleUrl: './trip-things-component.scss',
})
export class TripThingsComponent implements OnInit {

  tripId: string | null = null;

  ngOnInit(): void {
    this.tripId = this.route.snapshot.paramMap.get('tripId');
  }

  route = inject(ActivatedRoute);
  router = inject(Router);
  service: CrudService<TripUserThingDto, CreateTripThingRequest, UpdateTripThingRequest> = inject(TripThingService);

  fromDicservice: FromDicService = inject(TripThingService);

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

  toolBarButtons = [
    {
      id: 'back-button',
      icon: 'pi pi-chevron-left',
      tooltip: 'Back',
      command: () => {
        if (!this.tripId) {
          this.router.navigate(["trips"]);
          return;
        }

        this.router.navigate(["trips"], {
          queryParams: { selectId: this.tripId }
        });
      }
    }
  ]
}
