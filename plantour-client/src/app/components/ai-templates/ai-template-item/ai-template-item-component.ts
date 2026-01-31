import { Component, Input } from '@angular/core';
import { ThingDto } from '../../../services/thing-service';
import { VTemplateThingsFullDto } from '../../../services/template-service';
import { capitalizeFirstLetter } from '../../../helpers/utils';

@Component({
  selector: 'app-ai-template-item',
  imports: [
  ],
  templateUrl: './ai-template-item-component.html',
  styleUrl: './ai-template-item-component.scss',
})
export class AiTemplateItemComponent {
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
