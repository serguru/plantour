import { Component, inject } from '@angular/core';
import { CrudService } from '../../services/crud-service';
import { AdminsParticipantDto, UpdateAdminsParticipantRequest, AdminsParticipantService } from '../../services/admins-participant-service';
import { BaseListComponent } from '../base-list/base-list';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { SignUpParticipantRequest } from '../../models/auth.models';

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

  service: CrudService<AdminsParticipantDto, SignUpParticipantRequest, UpdateAdminsParticipantRequest> = inject(AdminsParticipantService);

  configuration: any[] = [
    {
      property: 'email',
      label: 'email',
      config: {
        filter: true,
        sorting: 'text'
      }
    },{
      property: 'firstName',
      label: 'First Name',
      config: {
        filter: true,
        sorting: 'text'
      }
    },{
      property: 'lastName',
      label: 'Last Name',
      config: {
        filter: true,
        sorting: 'text'
      }
    },{
      property: 'participantStatus',
      label: 'Status',
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
