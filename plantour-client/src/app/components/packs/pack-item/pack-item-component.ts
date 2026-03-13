import { Component, Input } from '@angular/core';
import { PackageDto } from '../../../services/package-service';
import { AmazonLinkComponent } from '../../amazon-link/amazon-link-component';

@Component({
  selector: 'app-pack-item',
  imports: [
    AmazonLinkComponent
  ],
  templateUrl: './pack-item-component.html',
  styleUrl: './pack-item-component.scss',
})
export class PackItemComponent {
  @Input() entity: PackageDto = {} as PackageDto;
}
