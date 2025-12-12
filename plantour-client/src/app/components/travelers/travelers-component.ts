import { Component, inject } from '@angular/core';
import { CrudService } from '../../services/crud-service';
import { AdminsParticipantDto, CreateAdminsParticipantRequest, UpdateAdminsParticipantRequest, AdminsParticipantService } from '../../services/admins-participant-service';
import { BaseListComponent } from '../base-list/base-list';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-travelers-component',
  standalone: true,
  imports: [
    BaseListComponent,
    TagModule
  ],
  templateUrl: './travelers-component.html',
  styleUrl: './travelers-component.scss',
})
export class TravelersComponent {
  router = inject(Router);

  service: CrudService<AdminsParticipantDto, CreateAdminsParticipantRequest, UpdateAdminsParticipantRequest> = inject(AdminsParticipantService);

  configuration: any[] = [
    {
      property: 'email',
      config: {
        filter: true,
        sorting: 'text'
      }
    },{
      property: 'firstName',
      config: {
        filter: true,
        sorting: 'text'
      }
    },{
      property: 'lastName',
      config: {
        filter: true,
        sorting: 'text'
      }
    },{
      property: 'participantStatus',
      config: {
        filter: true,
        sorting: 'text',
        lookupIcon: 'pi pi-flag'
      }
    }
  ];

  toolBarButtons =
    [
      {
        id: 'back-button',
        icon: 'pi pi-chevron-left',
        tooltip: 'Back',
        command: () => this.router.navigate([""])
      }
    ]

  onStatusClick(item: AdminsParticipantDto, $event: Event) {
     $event.stopPropagation(); 
     console.log('Status: ' + item.participantStatus);
  }
}
