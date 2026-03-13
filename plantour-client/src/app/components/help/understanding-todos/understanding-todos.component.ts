import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TodoFeature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-understanding-todos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './understanding-todos.component.html',
  styleUrl: './understanding-todos.component.scss'
})
export class UnderstandingTodosComponent {
  features: TodoFeature[] = [
    {
      icon: 'pi pi-check-square',
      title: 'Reusable Dictionary Entries',
      description: 'Todos in the Dictionary are reusable entries you can keep for future trips.'
    },
    {
      icon: 'pi pi-folder-open',
      title: 'Categories and Notes',
      description: 'Each todo can have a category and notes, but todos do not use units, values, or packing fields.'
    },
    {
      icon: 'pi pi-compass',
      title: 'Target a Trip',
      description: 'From the Todos screen you can target a trip and send dictionary todos into either your own trip todos or shared trip todos.'
    },
    {
      icon: 'pi pi-file-pdf',
      title: 'Included in Reports',
      description: 'Trip todos and shared trip todos are reflected in trip summaries and PDF output.'
    }
  ];

  workflow: string[] = [
    'Create reusable todos in the Dictionary when you want to keep standard reminders for future trips.',
    'Organize them with categories such as documents, bookings, health, or before-departure tasks.',
    'When planning a trip, use target mode to copy selected todos into your own trip todo list or the shared trip todo list.',
    'Edit the dictionary version later if you want to improve the reusable master entry for future trips.'
  ];

  keyPoints: string[] = [
    'Dictionary todos are not trip-specific until you target them to a trip.',
    'Todos support categories and notes only.',
    'Todos are separate from items: they track actions and reminders, not packable objects.',
    'Templates, AI recommendations, bag packing, units, and weights apply to items, not todos.'
  ];
}