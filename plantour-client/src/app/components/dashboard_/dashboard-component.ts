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
import { TripSummaryComponent } from './trip-summary/trip-summary-component';

interface TripSnapshot {
  name: string;
  location: string;
  status: 'Planned' | 'Preparation' | 'Active' | 'Completed';
  daysLeft: number;
  participants: number;
  packingProgress: number;
  sharedOverdue: number;
  sharedPending: number;
  sharedCompleted: number;
}

interface StatCard {
  label: string;
  value: string;
  icon: string;
  helper?: string;
  emphasis?: 'normal' | 'strong' | 'critical';
}

interface PhaseStat {
  label: string;
  value: number;
}

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
    AppButton,
    TripSummaryComponent
  ],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.scss']
})
export class DashboardComponent_ {
  isAdmin = true;

  lastActiveTrip: TripSnapshot = {
    name: 'Northern Fjords Expedition',
    location: 'Tromsø, Norway',
    status: 'Active',
    daysLeft: 6,
    participants: 12,
    packingProgress: 78,
    sharedOverdue: 4,
    sharedPending: 7,
    sharedCompleted: 15
  };

  participantStats: StatCard[] = [
    {
      label: 'Trips Joined',
      value: '14',
      icon: 'pi pi-compass',
      helper: 'Your participation history',
      emphasis: 'strong'
    },
    {
      label: 'Items Packed',
      value: '268',
      icon: 'pi pi-box',
      helper: 'Across your trips'
    },
    {
      label: 'Bags Used',
      value: '42',
      icon: 'pi pi-briefcase',
      helper: 'Personal packing load'
    },
    {
      label: 'Shared Tasks Done',
      value: '31',
      icon: 'pi pi-check-circle',
      helper: 'Completed assignments'
    }
  ];

  adminStats: StatCard[] = [
    {
      label: 'Total Trips',
      value: '62',
      icon: 'pi pi-map',
      helper: 'All time'
    },
    {
      label: 'Participants',
      value: '184',
      icon: 'pi pi-users',
      helper: 'Active network'
    },
    {
      label: 'Items Catalog',
      value: '1,920',
      icon: 'pi pi-list-check',
      helper: 'Across all trips'
    },
    {
      label: 'Bags Registered',
      value: '410',
      icon: 'pi pi-inbox',
      helper: 'All packs'
    }
  ];

  tripPhaseStats: PhaseStat[] = [
    { label: 'Planned', value: 9 },
    { label: 'Preparation', value: 6 },
    { label: 'Active', value: 3 },
    { label: 'Completed', value: 44 }
  ];

  get statusSeverity(): 'success' | 'info' | 'warn' | 'danger' {
    switch (this.lastActiveTrip.status) {
      case 'Active':
        return 'success';
      case 'Preparation':
        return 'warn';
      case 'Completed':
        return 'info';
      default:
        return 'danger';
    }
  }
}
