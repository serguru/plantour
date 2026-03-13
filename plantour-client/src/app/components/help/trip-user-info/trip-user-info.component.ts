import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trip-user-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-user-info.component.html',
  styleUrls: ['./trip-user-info.component.scss']
})
export class TripUserInfoComponent {
  mainHeading = 'Trip user info';

  intro =
    'This Dashboard section shows your personal summary for the selected trip, including personal counts and shared assignment status from your point of view.';

  sections = [
    {
      title: 'Top stats',
      paragraphs: [
        'Packs: how many packs (bags) are currently involved for you in this trip.',
        'Items: how many items are in scope for you.',
        'Todos: how many personal trip todos are in scope for you.',
        'Weight: shows up when the trip has weight information.'
      ]
    },
    {
      title: 'Shared Items status',
      paragraphs: [
        'Total: number of shared items in the trip.',
        'Assigned: shared items that already have an assignee.',
        'Pending: shared items waiting for confirmation or action.',
        'Overdue: shared items that missed their due time (if any).',
        'Success / Failure: completion outcome counters for shared items.'
      ],
      list: [
        'Use this panel to quickly spot if anything is blocked (Pending/Overdue).'
      ]
    },
    {
      title: 'Shared Todos status',
      paragraphs: [
        'Total: number of shared trip todos in the trip.',
        'Assigned / Pending / Overdue: quick indicators for collaborative action items.',
        'Success / Failure: completion outcome counters for shared trip todos.'
      ],
      list: [
        'Use this panel to spot reminders or responsibilities that still need action.'
      ]
    }
  ];
}
