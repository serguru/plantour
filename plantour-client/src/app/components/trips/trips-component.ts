import { Component, inject, OnInit } from '@angular/core';
import { CrudService } from '../../services/crud-service';
import { TripDto, TripService } from '../../services/trip-service';
import { BaseListComponent } from '../base-list/base-list';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { AppService } from '../../services/app-service';

@Component({
  selector: 'app-trips-component',
  imports: [
    BaseListComponent,
    TagModule
  ],
  standalone: true,
  templateUrl: './trips-component.html',
  styleUrl: './trips-component.scss',
})
export class TripsComponent implements OnInit{
  
  router = inject(Router);
  appService = inject(AppService);

  service: CrudService<TripDto, any, any> = inject(TripService);

  selected: TripDto | null = null;

  ngOnInit(): void {
    this.appService.tripSelected$.subscribe(trip => {
      this.selected = trip;
    });
  }


  onTripSelected = (trip: TripDto | null) => {
    this.appService.tripSelected.next(trip);
  };

  configuration: any[] = [
    {
      property: 'name',
      label: 'Name',
      config: {
        filter: true,
        sorting: 'text'
      }
    },{
      property: 'tripStatus',
      label: 'Status',
      config: {
        filter: true,
        sorting: 'text',
        lookupIcon: 'pi pi-compass'
      }
    }
  ];

  get selectedExists(): boolean {
    return this.selected !== null;
  }


  onStatusClick(item: TripDto, $event: Event) {
    $event.stopPropagation();
  }
}
