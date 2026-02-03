import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { AppButton } from '../button/button-component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ProgressBarModule,
    TagModule,
    BadgeModule,
    ButtonModule,
    AvatarModule,
    DividerModule,
    AppButton
  ],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.scss']
})
export class DashboardComponent {
  componentId = 'dashboard';

  items = [
    {
      id: 'trip-info',
      title: 'Trip info',
      description: 'Summary of the current trip overview, dates, and key milestones.',
      icon: 'pi pi-compass'
    },
    {
      id: 'user-trip-info',
      title: 'User Trip info',
      description: 'Your personal progress, assignments, and packing status for the trip.',
      icon: 'pi pi-user'
    },
    {
      id: 'all-users-trip-info',
      title: 'All Users Trip info',
      description: 'Team-wide progress view with shared items and responsibilities.',
      icon: 'pi pi-users'
    },
    {
      id: 'user-all-trips-info',
      title: 'User All Trips info',
      description: 'Overview of all your trips and their current statuses.',
      icon: 'pi pi-briefcase'
    },
    {
      id: 'all-users-all-trips-info',
      title: 'All Users All Trips info',
      description: 'Organization-wide snapshot of trips and participation.',
      icon: 'pi pi-chart-bar'
    }
  ];

  expandedItemId: string | null = null;

  toggleItem(itemId: string) {
    this.expandedItemId = this.expandedItemId === itemId ? null : itemId;
  }
}
