import { Component, Input } from '@angular/core';
import { capitalizeFirstLetter } from '../../../helpers/utils';

@Component({
  selector: 'app-ai-template-item',
  imports: [],
  templateUrl: './ai-template-item-component.html',
  styleUrl: './ai-template-item-component.scss',
})
export class AiTemplateItemComponent {
  @Input() entity: any = {};
  @Input() itemMetaData: any | null = null;

  get lowerText(): string {
    const text = this.entity?.recommendations || '';
    if (!text) {
      return '';
    }

    return capitalizeFirstLetter(String(text));
  }
}
