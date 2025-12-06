import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-things-utils',
  standalone: true,
  imports: [CommonModule, FormsModule, RadioButtonModule, InputTextModule, Select],
  templateUrl: './things-utils.component.html',
  styleUrl: './things-utils.component.scss',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: '0', opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('300ms ease-in', style({ height: '0', opacity: 0 }))
      ])
    ])
  ]
})
export class ThingsUtilsComponent {
  @Input() categories: string[] = [];
  @Input() packageNames: string[] | null = null;
  @Input() packingStatuses: string[] | null = null;
  @Input() showToolbar: boolean = false;
  
  @Input() selectedCategory: string | null = null;
  @Output() selectedCategoryChange = new EventEmitter<string | null>();
  
  @Input() selectedPackageName: string | null = null;
  @Output() selectedPackageNameChange = new EventEmitter<string | null>();
  
  @Input() selectedPackingStatus: string | null = null;
  @Output() selectedPackingStatusChange = new EventEmitter<string | null>();
  
  @Input() sortOrder: 'asc' | 'desc' | 'none' = 'none';
  @Output() sortOrderChange = new EventEmitter<'asc' | 'desc' | 'none'>();
  
  @Input() filterText: string = '';
  @Output() filterTextChange = new EventEmitter<string>();

  onCategoryChange(value: string | null): void {
    this.selectedCategory = value;
    this.selectedCategoryChange.emit(value);
  }

  onPackageNameChange(value: string | null): void {
    this.selectedPackageName = value;
    this.selectedPackageNameChange.emit(value);
  }

  onPackingStatusChange(value: string | null): void {
    this.selectedPackingStatus = value;
    this.selectedPackingStatusChange.emit(value);
  }

  onSortOrderChange(value: 'asc' | 'desc' | 'none'): void {
    this.sortOrder = value;
    this.sortOrderChange.emit(value);
  }

  onFilterTextChange(value: string): void {
    this.filterText = value;
    this.filterTextChange.emit(value);
  }
}
