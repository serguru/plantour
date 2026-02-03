import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { AppButton } from '../button/button-component';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ComponentService } from '../../services/component-service';
import { CurrentTripService } from '../../services/current-trip-service';
import { DashboardService, DashboardTripDto } from '../../services/dashboard-service';
import { TripSummaryComponent } from './trip-summary/trip-summary-component';


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
    TripSummaryComponent
  ],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.scss']
})
export class DashboardComponent implements OnInit {
  componentId = 'dashboard';
  dashboardService = inject(DashboardService);
  tripSummaryComponent = TripSummaryComponent;

  items = [
    {
      id: 'trip-info',
      title: 'Trip info',
      description: 'Summary of the current trip overview, dates, and key milestones.',
      icon: 'pi pi-compass',
      component: this.tripSummaryComponent,
      expanded: false
    },
    {
      id: 'user-trip-info',
      title: 'User Trip info',
      description: 'Your personal progress, assignments, and packing status for the trip.',
      icon: 'pi pi-user',
      expanded: false
    },
    {
      id: 'all-users-trip-info',
      title: 'All Users Trip info',
      description: 'Team-wide progress view with shared items and responsibilities.',
      icon: 'pi pi-users',
      expanded: false
    },
    {
      id: 'user-all-trips-info',
      title: 'User All Trips info',
      description: 'Overview of all your trips and their current statuses.',
      icon: 'pi pi-briefcase',
      expanded: false
    },
    {
      id: 'all-users-all-trips-info',
      title: 'All Users All Trips info',
      description: 'Organization-wide snapshot of trips and participation.',
      icon: 'pi pi-chart-bar',
      expanded: false
    }
  ];

  //expandedItemId: string | null = null;

  toggleItem(item: any) {
    item.expanded = !item.expanded;
  }

//  currentTripService = inject(CurrentTripService);

//  data: DashboardTripDto | null = null;

  ngOnInit(): void {
    // this.dashboardService.getDashboardTripDto().subscribe(data => {
    //   this.data = data;
    // });
  }

}
