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
  @Input() itemMetaData: { lowerTextVisible?: () => boolean } | null = null;

  get lowerText(): string {
    const parts: string[] = [];

    if (typeof this.entity.packingListIncluded === 'boolean') {
      parts.push(`packing list: ${this.entity.packingListIncluded ? 'included' : 'excluded'}`);
    }

    const weightValue = this.entity.weightValue;
    const weightUnit = this.entity.weightUnit?.trim();
    if (weightValue != null && weightUnit) {
      parts.push(`weight: ${weightValue} ${weightUnit}`);
    }

    return parts.join(', ');
  }

}
