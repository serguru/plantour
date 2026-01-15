import { Component, Input, Output, EventEmitter, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-component.html',
  styleUrls: ['./button-component.scss']
})
export class AppButton {
  label = input<string>('');
  icon = input<string>('');
  severity = input<'primary' | 'secondary'>('primary');
  disabled = input<boolean>(false);
  loading = input(false)



}