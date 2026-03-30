import { Component, Input } from '@angular/core';
import { KeyDto } from '../../../services/key-service';

@Component({
  selector: 'app-key-item',
  templateUrl: './key-item-component.html',
  styleUrl: './key-item-component.scss',
})
export class KeyItemComponent {
  @Input() entity: KeyDto = {} as KeyDto;

  get maskedKey(): string {
    const value = this.entity.key ?? '';
    if (!value) {
      return '';
    }

    if (value.length <= 4) {
      return '*'.repeat(value.length);
    }

    return `${'*'.repeat(value.length - 4)}${value.slice(-4)}`;
  }
}