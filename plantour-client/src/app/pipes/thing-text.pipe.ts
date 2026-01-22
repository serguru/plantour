import { Pipe, PipeTransform } from '@angular/core';
import { getThingText } from '../helpers/utils';

@Pipe({
  name: 'thingText',
  standalone: true
})
export class ThingTextPipe implements PipeTransform {

  transform(value: string, units: any | null, numericValue: any | null): string {
    const result = getThingText(value, units, numericValue);
    return result;
  }
}
