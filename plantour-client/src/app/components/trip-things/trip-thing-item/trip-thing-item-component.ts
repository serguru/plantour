import { Component, Input } from '@angular/core';
import { TripThingDto } from '../../../services/trip-thing-service';
import { TripPackageDto } from '../../../services/trip-package-service';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';

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
  @Input() itemMetaData: TripPackageDto[] | null = null;


}
