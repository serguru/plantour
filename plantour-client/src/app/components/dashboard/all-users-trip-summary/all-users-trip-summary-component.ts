import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';

import { map, Observable, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardService, DashboardAllUsersTripDto } from '../../../services/dashboard-service';


@Component({
  selector: 'app-all-users-trip-summary',
  imports: [
    CardModule,
    ProgressBarModule
],
  templateUrl: './all-users-trip-summary-component.html',
  styleUrl: './all-users-trip-summary-component.scss',
})
export class AllUsersTripSummaryComponent implements OnInit {

  @Input() 
  selectedTripId$!: Observable<string>;

  dashboardService = inject(DashboardService);
  destroyRef = inject(DestroyRef);

  tripData: DashboardAllUsersTripDto | null = null;

  ngOnInit(): void {
    this.selectedTripId$.pipe(
      switchMap(tripId => {
        if (!tripId) {
          return of(null);
        }
        return this.dashboardService.getDashboardAllUsersTripDto(tripId);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(trip => {
      this.tripData = trip;
    });
  }
}
