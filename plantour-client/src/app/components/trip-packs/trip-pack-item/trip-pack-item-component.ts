import { Component, Input } from '@angular/core';
import { TripPackageDto } from '../../../services/trip-package-service';
import { PackTextPipe } from '../../../pipes/pack-text.pipe';

@Component({
  selector: 'app-trip-pack-item-component',
  imports: [
    PackTextPipe
  ],
  templateUrl: './trip-pack-item-component.html',
  styleUrl: './trip-pack-item-component.scss',
})
export class TripPackItemComponent {
  @Input() entity: TripPackageDto = {} as TripPackageDto;

}
