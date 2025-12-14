import { Component, inject } from '@angular/core';
import { CrudService } from '../../services/crud-service';
import { TripDto, TripService } from '../../services/trip-service';
import { BaseListComponent } from '../base-list/base-list';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';

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
export class TripsComponent {
  router = inject(Router);

  service: CrudService<TripDto, any, any> = inject(TripService);

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

  toolBarButtons = [
    {
      id: 'back-button',
      icon: 'pi pi-chevron-left',
      tooltip: 'Back',
      command: () => this.router.navigate([""])
    }
  ]

  onStatusClick(item: TripDto, $event: Event) {
    $event.stopPropagation();
    console.log('Status: ' + item.tripStatus);
  }
}
