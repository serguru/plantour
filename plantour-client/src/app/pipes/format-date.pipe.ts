import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
  standalone: true
})
export class FormatDatePipe implements PipeTransform {
  transform(value: any): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    return date.toLocaleDateString();
  }
}