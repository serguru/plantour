import { Component, Input, Output, EventEmitter, inject, input } from '@angular/core';


@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button-component.html',
  styleUrls: ['./button-component.scss']
})
export class AppButton {
  label = input<string>('');
  icon = input<string>('');
  type = input<'button' | 'submit' | 'reset'>('button');
  severity = input<'primary' | 'secondary'>('primary');
  disabled = input<boolean>(false);
  loading = input(false)



}