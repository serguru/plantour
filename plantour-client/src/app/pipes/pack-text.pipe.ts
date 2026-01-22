import { Pipe, PipeTransform } from '@angular/core';
import { getPackageText } from '../helpers/utils';

@Pipe({
  name: 'packText',
  standalone: true
})
export class PackTextPipe implements PipeTransform {

  transform(value: string, label: any | null): string {
    const result = getPackageText(value, label);
    return result;
  }
}
