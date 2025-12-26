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
    //this.toolBarButtons.forEach((x, i)  => {if(i == 0) return; (x as any).disabled = !this.selected});
    this.toolBarMenus.forEach(x  => x.disabled = !this.selected);
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
    }
  ]

  toolBarMenus = [
    {
      label: "Participants",
      icon: 'pi pi-user',
      disabled: true,
      command: () => this.router.navigate([`trips/${this.selected ? this.selected.id : ''}/trip-participants`])
    },{
      label: "Packs",
      icon: 'pi pi-box',
      disabled: true,
      command: () => this.router.navigate([`trips/${this.selected ? this.selected.id : ''}/trip-packs`])
    },{
      label: 'Things',
      icon: 'pi pi-objects-column',
      disabled: true,
      command: () => this.router.navigate([`trips/${this.selected ? this.selected.id : ''}/trip-things`])
    },{
      label: 'Shared',
      icon: 'pi pi-share-alt',
      disabled: true,
      command: () => this.router.navigate([`trips/${this.selected ? this.selected.id : ''}/trip-shared`])
    }
  ];

  onStatusClick(item: TripDto, $event: Event) {
    $event.stopPropagation();
  }
}
