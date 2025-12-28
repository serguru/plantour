import { Component, inject } from '@angular/core';
import { CrudService, FromDicService } from '../../services/crud-service';
import { AdminsParticipantDto, UpdateAdminsParticipantRequest, AdminsParticipantService } from '../../services/admins-participant-service';
import { BaseListComponent } from '../base-list/base-list';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { SignUpParticipantRequest } from '../../models/auth.models';
import { CreateTripUserRequest, TripUserDto, TripUserService, UpdateTripUserRequest } from '../../services/trip-user-service';
import { UpperActionType } from '../../helpers/enums';

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
  componentId: string = 'travelers';
  router = inject(Router);
  public ActionType = UpperActionType;

  service: CrudService<AdminsParticipantDto, SignUpParticipantRequest, UpdateAdminsParticipantRequest> = inject(AdminsParticipantService);

  tripDicService: CrudService<TripUserDto, CreateTripUserRequest, UpdateTripUserRequest> = inject(TripUserService);
  fromDicService: FromDicService = inject(TripUserService);


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

  onStatusClick(item: AdminsParticipantDto, $event: Event) {
     $event.stopPropagation(); 
     console.log('Status: ' + item.participantStatus);
  }
}
