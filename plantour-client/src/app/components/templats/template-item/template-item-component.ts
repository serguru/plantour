import { Component, Input } from '@angular/core';
import { ThingDto } from '../../../services/thing-service';
import { VTemplateThingsFullDto } from '../../../services/template-service';
import { Tag } from 'primeng/tag';
import { capitalizeFirstLetter } from '../../../helpers/utils';

@Component({
  selector: 'app-template-item',
  imports: [
    Tag
  ],
  templateUrl: './template-item-component.html',
  styleUrl: './template-item-component.scss',
})
export class TemplateItemComponent {
  @Input() entity: VTemplateThingsFullDto = {} as VTemplateThingsFullDto;
  @Input() itemMetaData: any | null = null;


  get lowerText(): string {

    const array: string[] = [];

    if (this.entity.activityName) {
      array.push(`activity: ${this.entity.activityName}`);
    }
    if (this.entity.temperatureRangeName) {
      array.push(`temperature: ${this.entity.temperatureRangeName}`);
    }
    if (this.entity.ageRangeName) {
      array.push(`age: ${this.entity.ageRangeName}`);
    }

    if (array.length == 0) {
      return '';
    }
    array[0] = capitalizeFirstLetter(array[0]);
    const result = array.join(', ');
    return result;
  }
}
