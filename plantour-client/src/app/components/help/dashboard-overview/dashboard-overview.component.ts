import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.scss']
})
export class DashboardOverviewComponent {
  mainHeading = 'Dashboard overview';

  intro =
    'The Dashboard gives you a quick summary of a selected trip. It is built around expandable sections so you can focus on one overview at a time.';

  sections = [
    {
      title: 'Main areas',
      paragraphs: [
        'Trip selector: choose which trip the Dashboard should summarize.',
        'Expandable summary sections: click a row to open its details.',
        'Help entry in the header menu: opens the Help page directly to a Dashboard topic.'
      ]
    },
    {
      title: 'Dashboard sections',
      paragraphs: [
        'Trip info: general trip header information (name, status, dates).',
        'User Trip info: your personal summary for the selected trip, including item and todo counts.',
        'All Users Trip info: team-wide summary for the selected trip, including shared-item and shared-todo status.'
      ],
      list: [
        'Click a section to expand/collapse it.',
        'Changing the trip updates the data inside all sections.'
      ]
    }
  ];
}
