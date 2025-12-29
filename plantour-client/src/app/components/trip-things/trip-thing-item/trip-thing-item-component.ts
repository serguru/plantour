import { Component, inject, Input } from '@angular/core';
import { TripThingDto, TripThingService } from '../../../services/trip-thing-service';
import { TripPackageDto, TripPackageService } from '../../../services/trip-package-service';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../../services/app-service';
import { MultipleIdsRequest } from '../../../services/crud-service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-trip-thing-item-component',
  imports: [
    Select,
    FormsModule
  ],
  templateUrl: './trip-thing-item-component.html',
  styleUrl: './trip-thing-item-component.scss',
})
export class TripThingItemComponent {
  @Input() item: TripThingDto = {} as TripThingDto;
  @Input() itemMetaData: TripPackageDto[] = [];

  tripThingService = inject(TripThingService);
  appService = inject(AppService);

  onPackageChange(item: TripThingDto) {

    const tripId = this.appService.tripSelected.value?.id;

    if (!tripId) {
      throw new Error('No trip selected');
    }

    const multipleIdsRequest: MultipleIdsRequest = {
      collectionId: tripId,
      ids: [item.id],
      id: item.tripUserPackageId
    };

    const o = item.tripUserPackageId ?
      this.tripThingService.pack(multipleIdsRequest) :
      this.tripThingService.unpack(multipleIdsRequest);

    o.pipe(
      switchMap(() => this.tripThingService.getAll(tripId))
    ).subscribe(
    );

  }
}
