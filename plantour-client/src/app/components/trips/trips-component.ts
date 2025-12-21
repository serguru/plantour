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

  selected: TripDto | null = null;

  onTripSelected = (trip: TripDto | null) => {
    this.selected = trip;
    this.toolBarButtons.forEach((x, i)  => {if(i == 0) return; x.disabled = !this.selected});
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

  toolBarButtons = [
    {
      id: 'back-button',
      icon: 'pi pi-chevron-left',
      tooltip: 'Back',
      command: () => this.router.navigate([""])
    },{
      id: 'trip-participants-button',
      icon: 'pi pi-user',
      tooltip: 'Trip participants',
      disabled: true,
      command: () => this.router.navigate([`trips/${this.selected ? this.selected.id : ''}/trip-participants`])
    },{
      id: 'trip-packs-button',
      icon: 'pi pi-box',
      tooltip: 'Trip packs',
      disabled: true,
      command: () => this.router.navigate([`trips/${this.selected ? this.selected.id : ''}/trip-packs`])
    },{
      id: 'trip-things-button',
      icon: 'pi pi-objects-column',
      tooltip: 'Trip things',
      disabled: true,
      command: () => this.router.navigate([`trips/${this.selected ? this.selected.id : ''}/trip-things`])
    }
  ]

  onStatusClick(item: TripDto, $event: Event) {
    $event.stopPropagation();
  }
}
