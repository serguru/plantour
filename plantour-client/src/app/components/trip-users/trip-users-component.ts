import { Component, inject, OnInit } from '@angular/core';
import { CrudService, FromDicService } from '../../services/crud-service';
import { TripUserDto, CreateTripUserRequest, UpdateTripUserRequest, TripUserService } from '../../services/trip-user-service';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseListComponent } from '../base-list/base-list';
import { UpperActionType } from '../../helpers/enums';
import { TripUserItemComponent } from './trip-user-item/trip-user-item-component';

@Component({
  selector: 'app-trip-participants',
  standalone: true,
  imports: [
    BaseListComponent
  ],
  templateUrl: './trip-users-component.html',
  styleUrl: './trip-users-component.scss',
})
export class TripUsersComponent implements OnInit {
  tripUserItemComponent = TripUserItemComponent;  
  componentId: string = 'trip-users';

  tripId: string | null = null;
  public ActionType = UpperActionType;

  ngOnInit(): void {
    this.tripId = this.route.snapshot.paramMap.get('tripId');
  }

  route = inject(ActivatedRoute);
  router = inject(Router);
  service: CrudService<TripUserDto, CreateTripUserRequest, UpdateTripUserRequest> = inject(TripUserService);

  fromDicservice: FromDicService = inject(TripUserService);

  configuration: any[] = [
    {
      property: 'email',
      label: 'Email',
      icon: 'pi pi-envelope',
      config: {
        lookupIcon: 'pi pi-envelope',
        filter: true,
        sorting: 'text'
      }
    },
    {
      property: 'firstName',
      label: 'First Name',
      icon: 'pi pi-user',
      config: {
        filter: true,
        sorting: 'text'
      }
    },
    {
      property: 'lastName',
      label: 'Last Name',
      icon: 'pi pi-user',
      config: {
        filter: true,
        sorting: 'text'
      }
    },
    {
      property: 'participantStatus',
      label: 'Status',
      icon: 'pi pi-flag',
      config: {
        filter: true,
        sorting: 'text'
      }
    }
  ];



}
