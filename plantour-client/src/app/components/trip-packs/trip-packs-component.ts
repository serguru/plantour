import { Component, inject, OnInit } from '@angular/core';
import { CrudService, FromDicService } from '../../services/crud-service';
import { TripPackageDto, CreateTripPackageRequest, UpdateTripPackageRequest, TripPackageService } from '../../services/trip-package-service';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseListComponent } from '../base-list/base-list';
import { UpperActionType } from '../../helpers/enums';
import { TripPackItemComponent } from './trip-pack-item/trip-pack-item-component';
import { AppService } from '../../services/app-service';
import { MessagesService } from '../../services/messages-service';


@Component({
  selector: 'app-trip-packs',
  standalone: true,
  imports: [
    BaseListComponent
  ],
  templateUrl: './trip-packs-component.html',
  styleUrl: './trip-packs-component.scss',
})
export class TripPacksComponent implements OnInit {
  appService = inject(AppService);
  messagesService = inject(MessagesService);
  tripPackItemComponent = TripPackItemComponent;
  componentId: string = 'trip-packs';
  public ActionType = UpperActionType;

  tripId: string | null = null;

  ngOnInit(): void {
    // This component cannot be accessed unless a trip is selected
    // This is enforced by the checkTripIdGuard in the routing configuration

    
    
    // if (!this.appService.tripSelected.getValue()) {
    //   this.messagesService.showError('No trip selected', 'Please select a trip first.');
    //   this.router.navigate(['/trips']);
    // }
  }

  route = inject(ActivatedRoute);
  router = inject(Router);
  service: CrudService<TripPackageDto, CreateTripPackageRequest, UpdateTripPackageRequest> = inject(TripPackageService);

  fromDicservice:FromDicService = inject(TripPackageService);

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


}
