import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pl-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-component.html',
  styleUrls: ['./button-component.scss']
})
export class PlButtonComponent {
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() severity: 'primary' | 'success' | 'danger' | 'warning' = 'primary';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;

  @Output() onClick = new EventEmitter<MouseEvent>();

  handleButtonClick(event: MouseEvent) {
    if (!this.disabled) {
      this.onClick.emit(event);
    }
  }
}