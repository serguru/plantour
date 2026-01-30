import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverModule } from 'primeng/popover';

export interface MenuConfig {
  label: string;
  icon: string;
  action: () => void;
}

@Component({
  selector: 'app-form-header',
  imports: [
    CommonModule,
    PopoverModule
  ],
  templateUrl: './form-header.html',
  styleUrl: './form-header.scss',
})
export class FormHeader {
  title = input<string>();
  icon = input<string>();
  menuItems = input<MenuConfig[]>([]);
}
