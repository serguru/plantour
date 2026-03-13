import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TripTodoSection {
  title: string;
  description: string;
  points: string[];
}

@Component({
  selector: 'app-understanding-trip-todos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './understanding-trip-todos.component.html',
  styleUrl: './understanding-trip-todos.component.scss'
})
export class UnderstandingTripTodosComponent {
  intro = 'Trip Todos are the personal todo entries inside one trip. Use them for reminders and action tracking that belong to a single trip context.';

  sections: TripTodoSection[] = [
    {
      title: 'How Trip Todos Are Created',
      description: 'Trip todos can be created directly inside the trip or copied from the Dictionary.',
      points: [
        'Participants of the current trip can open the Trip Todos page.',
        'Admins and participants can add their own trip todos on that page.',
        'Dictionary todos can be targeted into a trip to save time.'
      ]
    },
    {
      title: 'What Trip Todos Store',
      description: 'Trip todos keep the information focused on reminders and actions.',
      points: [
        'Name is required.',
        'Category and notes are optional.',
        'There are no bag assignments, units, values, or weights for trip todos.'
      ]
    },
    {
      title: 'Status and Completion',
      description: 'Ordinary personal trip todos are simple reminders. Assignment status appears only when a shared trip todo was accepted and linked to your trip todo list.',
      points: [
        'If a trip todo came from an accepted shared todo assignment, it shows assignment status.',
        'Accepted shared assignments can be marked as finished with success or failure from the trip todo list.',
        'Unshared personal trip todos stay as simple reminders without assignment workflow.'
      ]
    }
  ];
}