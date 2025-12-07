import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageWrapper, PageAction } from '../page-wrapper/page-wrapper';
import { ListWrapper } from '../page-wrapper/list-wrapper/list-wrapper';
import { ControlsWrapper } from '../page-wrapper/controls-wrapper/controls-wrapper';
import { ContentLayoutComponent } from '../layouts/content-layout.component';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

interface DemoItem {
  id: number;
  name: string;
  category: string;
  description?: string;
}

@Component({
  selector: 'app-page-wrapper-demo',
  imports: [
    CommonModule,
    PageWrapper,
    ListWrapper,
    ControlsWrapper,
    ContentLayoutComponent,
    FormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule
  ],
  templateUrl: './page-wrapper-demo.html',
  styleUrl: './page-wrapper-demo.scss',
})
export class PageWrapperDemo {
  viewMode = signal<'list' | 'form'>('list');

  // List view data
  items: DemoItem[] = [
    { id: 1, name: 'Passport', category: 'Documents', description: 'International travel document' },
    { id: 2, name: 'Backpack', category: 'Luggage', description: '40L hiking backpack' },
    { id: 3, name: 'First Aid Kit', category: 'Medical', description: 'Emergency medical supplies' },
    { id: 4, name: 'Water Bottle', category: 'Accessories', description: '1L stainless steel' },
    { id: 5, name: 'Phone Charger', category: 'Electronics', description: 'USB-C fast charger' }
  ];

  selectedItem: DemoItem | null = null;

  // Form view data
  formName = '';
  formCategory = '';
  formDescription = '';
  
  categories = [
    { label: 'Documents', value: 'Documents' },
    { label: 'Luggage', value: 'Luggage' },
    { label: 'Medical', value: 'Medical' },
    { label: 'Accessories', value: 'Accessories' },
    { label: 'Electronics', value: 'Electronics' }
  ];

  // Page actions for list view
  listActions: PageAction[] = [
    {
      icon: 'pi pi-refresh',
      label: 'Refresh',
      action: () => this.onRefresh(),
      severity: 'secondary'
    },
    {
      icon: 'pi pi-plus',
      label: 'Add Item',
      action: () => this.switchToForm(),
      severity: 'primary'
    }
  ];

  // Page actions for form view
  formActions: PageAction[] = [
    {
      icon: 'pi pi-times',
      label: 'Cancel',
      action: () => this.switchToList(),
      severity: 'secondary'
    }
  ];

  onRefresh() {
    console.log('Refreshing list...');
  }

  switchToForm() {
    console.log('Switching to form view...');
    this.formName = '';
    this.formCategory = '';
    this.formDescription = '';
    this.viewMode.set('form');
  }

  switchToList() {
    console.log('Switching to list view...');
    this.viewMode.set('list');
  }

  onSelectItem(item: DemoItem) {
    this.selectedItem = item;
    console.log('Selected item:', item);
  }

  onSubmitForm() {
    const newItem: DemoItem = {
      id: this.items.length + 1,
      name: this.formName,
      category: this.formCategory,
      description: this.formDescription
    };
    this.items.push(newItem);
    console.log('Added new item:', newItem);
    this.switchToList();
  }
}
