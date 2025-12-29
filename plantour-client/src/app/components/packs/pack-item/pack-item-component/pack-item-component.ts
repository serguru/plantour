import { Component, Input } from '@angular/core';
import { PackageDto } from '../../../../services/package-service';

@Component({
  selector: 'app-pack-item',
  imports: [],
  templateUrl: './pack-item-component.html',
  styleUrl: './pack-item-component.scss',
})
export class PackItemComponent {
  @Input() data: PackageDto = {} as PackageDto;
}
