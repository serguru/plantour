import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trip-all-users-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-all-users-info.component.html',
  styleUrls: ['./trip-all-users-info.component.scss']
})
export class TripAllUsersInfoComponent {
  mainHeading = 'Trip all users info';

  intro =
    'This Dashboard section shows a team-wide summary for the selected trip, including overall packing progress plus shared item and shared todo status.';

  sections = [
    {
      title: 'Top stats',
      paragraphs: [
        'Participants: how many users are participating in this trip.',
        'Packs: how many packs (bags) exist across all users for this trip.',
        'Todos: how many trip todos exist across the trip summary.',
        'Weight: shows up when the trip has weight information.'
      ]
    },
    {
      title: 'Packing Progress',
      paragraphs: [
        'The progress bar shows the overall packing completion percentage for the trip.'
      ]
    },
    {
      title: 'Shared Items status',
      paragraphs: [
        'Total / Assigned / Pending / Overdue: a quick health check for group responsibilities.',
        'Success / Failure: aggregated completion outcomes for shared items.'
      ],
      list: [
        'If Pending or Overdue is high, review Shared Items and reassign or confirm responsibilities.'
      ]
    },
    {
      title: 'Shared Todos status',
      paragraphs: [
        'Total / Assigned / Pending / Overdue: a quick health check for collaborative reminders and actions.',
        'Success / Failure: aggregated completion outcomes for shared trip todos.'
      ],
      list: [
        'If Pending or Overdue is high, review Shared Trip Todos and rebalance responsibilities.'
      ]
    }
  ];
}
