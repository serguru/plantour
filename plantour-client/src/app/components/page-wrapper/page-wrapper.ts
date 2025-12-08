import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

export interface PageAction {
  icon: string;
  label?: string;
  action: () => void;
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'danger' | 'help' | 'contrast';
}

@Component({
  selector: 'app-page-wrapper',
  imports: [CommonModule, ButtonModule],
  templateUrl: './page-wrapper.html',
  styleUrl: './page-wrapper.scss',
})
export class PageWrapper {
  @Input() pageIcon: string = 'pi pi-file';
  @Input() pageTitle: string = '';
  @Input() actions: PageAction[] = [];
}
