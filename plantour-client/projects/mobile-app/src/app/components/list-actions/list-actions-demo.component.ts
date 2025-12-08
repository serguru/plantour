import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListActionsComponent, PropertyConfig } from './list-actions.component';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-list-actions-demo',
  standalone: true,
  imports: [
    CommonModule,
    ListActionsComponent,
    TableModule
  ],
  templateUrl: './list-actions-demo.component.html',
  styleUrls: ['./list-actions-demo.component.scss']
})
export class ListActionsDemoComponent {
  // Sample data
  originalData = [
    { name: 'Tom', category: 'Engineer', age: 30, status: 'Active' },
    { name: 'Alice', category: 'Doctor', age: 26, status: 'Invited' },
    { name: 'Bob', category: 'Scientist', age: 35, status: 'Active' },
    { name: 'Carol', category: 'Engineer', age: 28, status: 'Banned' },
    { name: 'David', category: 'Doctor', age: 42, status: 'Active' },
    { name: 'Eve', category: 'Scientist', age: 31, status: 'Invited' },
    { name: 'Frank', category: 'Engineer', age: 29, status: 'Active' },
    { name: 'Grace', category: 'Doctor', age: 38, status: 'Banned' },
    { name: 'Henry', category: 'Scientist', age: 27, status: 'Active' },
    { name: 'Ivy', category: 'Engineer', age: 33, status: 'Invited' }
  ];

  filteredData = [...this.originalData];

  // Configuration
  configuration: PropertyConfig[] = [
    {
      property: 'name',
      icon: 'pi pi-user',
      config: {
        lookup: false,
        filter: true,
        sorting: 'text'
      }
    },
    {
      property: 'category',
      icon: 'pi pi-briefcase',
      config: {
        lookup: true,
        'lookup-list': ['Engineer', 'Doctor', 'Scientist'],
        filter: true,
        sorting: 'string'
      }
    },
    {
      property: 'age',
      icon: 'pi pi-calendar',
      config: {
        lookup: false,
        filter: false,
        sorting: 'number'
      }
    },
    {
      property: 'status',
      icon: 'pi pi-check-circle',
      config: {
        lookup: true,
        'lookup-list': ['Active', 'Invited', 'Banned'],
        filter: true,
        sorting: 'none'
      }
    }
  ];

  onDataChanged(processedData: any[]): void {
    this.filteredData = processedData;
  }
}
