import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SharedTodoFeature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-understanding-shared-todos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './understanding-shared-todos.component.html',
  styleUrl: './understanding-shared-todos.component.scss'
})
export class UnderstandingSharedTodosComponent {
  features: SharedTodoFeature[] = [
    {
      icon: 'pi pi-user-edit',
      title: 'Admin-Controlled Creation',
      description: 'Trip admins create and edit shared trip todos.'
    },
    {
      icon: 'pi pi-user-check',
      title: 'One Assignee at a Time',
      description: 'A shared trip todo is assigned to one participant at a time, with an optional deadline.'
    },
    {
      icon: 'pi pi-thumbs-up',
      title: 'Accept or Reject',
      description: 'The assignee can accept the responsibility or reject it if they cannot handle it.'
    },
    {
      icon: 'pi pi-check-circle',
      title: 'Success or Failure Tracking',
      description: 'Accepted assignments are completed from the assignee’s Trip Todos list with a success or failure result.'
    }
  ];

  workflow: string[] = [
    'An admin creates a shared trip todo inside the current trip.',
    'The admin assigns it to one participant and can set a deadline.',
    'The participant reviews the assignment in Shared Trip Todos and accepts or rejects it.',
    'If accepted, the system links it into the participant’s Trip Todos list.',
    'The participant marks the work as finished successfully or failed from their Trip Todos view.',
    'Admins track pending, assigned, overdue, success, and failure states from the shared trip todo view and dashboard.'
  ];

  keyPoints: string[] = [
    'Shared trip todos are for collaboration and responsibility tracking.',
    'Shared trip todos are different from shared items because they track actions, not packable objects.',
    'Participants do not create shared trip todos directly; admins manage that list.',
    'Acceptance and completion are participant actions, while assignment and reassignment stay with admins.'
  ];
}