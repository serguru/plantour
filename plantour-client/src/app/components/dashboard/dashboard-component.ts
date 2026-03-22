import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { DashboardService, DashboardTripDto } from '../../services/dashboard-service';
import { TripSummaryComponent } from './trip-summary/trip-summary-component';
import { Select } from "primeng/select";
import { TripDto, TripService } from '../../services/trip-service';
import { FormsModule } from '@angular/forms';
import { UserTripSummaryComponent } from './user-trip-summary/user-trip-summary-component';
import { AllUsersTripSummaryComponent } from './all-users-trip-summary/all-users-trip-summary-component';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { FormHeader } from '../form/form-header/form-header';
import { CurrentTripService } from '../../services/current-trip-service';

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
    Select,
    FormsModule,
    FormHeader
],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.scss']
})
export class DashboardComponent implements OnInit {
  componentId = 'dashboard';
  dashboardService = inject(DashboardService);
  tripSummaryComponent = TripSummaryComponent;
  userTripSummaryComponent = UserTripSummaryComponent;
  allUsersTripSummaryComponent = AllUsersTripSummaryComponent;

  menuItems = computed<MenuConfig[]>(() => []);

  tripService = inject(TripService);
  currentTripService = inject(CurrentTripService);

  trips: TripDto[] = [];

  selectedTripIdSubject = new BehaviorSubject<string | null>(null);
  selectedTripId$ = this.selectedTripIdSubject.asObservable();
  selectedTripId = toSignal(this.selectedTripId$, { initialValue: null });

  onTripChange(event: any) {
    this.selectedTripIdSubject.next(event.value);
    this.currentTripService.updateCurrentTripId(event.value);
  }

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
      component: this.userTripSummaryComponent,
      expanded: false
    },
    {
      id: 'all-users-trip-info',
      title: 'All Users Trip info',
      description: 'Team-wide progress view with shared items and responsibilities.',
      icon: 'pi pi-users',
      component: this.allUsersTripSummaryComponent,
      expanded: false
    }
  ];

  toggleItem(item: any) {
    item.expanded = !item.expanded;
    if (!item.expanded) {
      item.tripId = null;
    }

  }

  ngOnInit(): void {
    this.tripService.getAll().subscribe(trips => {
      this.trips = trips?.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1)) || [];
      if (this.trips.length == 0) {
        return;
      }
      const currentTripId = this.currentTripService.currentTripIdSignal();
      if (currentTripId) {
        const trip = trips.find(x => x.id == currentTripId);
        if (trip) {
          this.selectedTripIdSubject.next(trip.id);
          return;
        }
      }
      this.selectedTripIdSubject.next(this.trips[0].id);
      this.currentTripService.updateCurrentTripId(this.trips[0].id)
    });
  }

  getEntityInputs() {
    const inputs: any = {
      selectedTripId$: this.selectedTripId$
    };
    return inputs;
  }
}
