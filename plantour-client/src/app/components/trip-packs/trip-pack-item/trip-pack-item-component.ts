import { Component, Input } from '@angular/core';
import { TripPackageDto } from '../../../services/trip-package-service';

@Component({
  selector: 'app-trip-pack-item-component',
  imports: [],
  templateUrl: './trip-pack-item-component.html',
  styleUrl: './trip-pack-item-component.scss',
})
export class TripPackItemComponent {
  @Input() entity: TripPackageDto = {} as TripPackageDto;

}
