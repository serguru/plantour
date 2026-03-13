import { Component, Input } from '@angular/core';
import { TripPackageDto } from '../../../services/trip-package-service';
import { PackTextPipe } from '../../../pipes/pack-text.pipe';
import { AmazonLinkComponent } from '../../amazon-link/amazon-link-component';

@Component({
  selector: 'app-trip-pack-item-component',
  imports: [
    PackTextPipe,
    AmazonLinkComponent
  ],
  templateUrl: './trip-pack-item-component.html',
  styleUrl: './trip-pack-item-component.scss',
})
export class TripPackItemComponent {
  @Input() entity: TripPackageDto = {} as TripPackageDto;

}
