import { Component, computed, inject, OnInit, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TripSummaryComponent } from '../dashboard/trip-summary/trip-summary-component';
import { Select } from 'primeng/select';
import { TripDto, TripService } from '../../services/trip-service';
import { FormsModule } from '@angular/forms';
import { UserTripSummaryComponent } from '../dashboard/user-trip-summary/user-trip-summary-component';
import { AllUsersTripSummaryComponent } from '../dashboard/all-users-trip-summary/all-users-trip-summary-component';
import { MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { FormHeader } from '../form/form-header/form-header';
import { CurrentTripService } from '../../services/current-trip-service';

@Component({
  selector: 'app-trip-info',
  standalone: true,
  imports: [
    CommonModule,
    Select,
    FormsModule,
    FormHeader
  ],
  templateUrl: './trip-info-component.html',
  styleUrls: ['./trip-info-component.scss']
})
export class TripInfoComponent implements OnInit {
  componentId = 'trip-info';
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

  items: { id: string; title: string; description: string; icon: string; component: Type<any>; expanded: boolean }[] = [
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
      this.currentTripService.updateCurrentTripId(this.trips[0].id);
    });
  }

  getEntityInputs() {
    const inputs: any = {
      selectedTripId$: this.selectedTripId$
    };
    return inputs;
  }
}