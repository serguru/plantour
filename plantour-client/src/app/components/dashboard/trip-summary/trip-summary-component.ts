import { Component, DestroyRef, inject, Input, input, OnInit } from '@angular/core';
import { AppButton } from '../../button/button-component';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { CurrentTripService } from '../../../services/current-trip-service';
import { map, Observable, of, startWith, switchMap, withLatestFrom } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DashboardService, DashboardTripDto } from '../../../services/dashboard-service';


@Component({
  selector: 'app-trip-summary',
  imports: [
    CommonModule,
    CardModule,
    ProgressBarModule,
    TagModule,
    BadgeModule,
    ButtonModule,
    AvatarModule,
    DividerModule
  ],
  templateUrl: './trip-summary-component.html',
  styleUrl: './trip-summary-component.scss',
})
export class TripSummaryComponent implements OnInit {

  @Input() 
  selectedTripId$!: Observable<string>;

  dashboardService = inject(DashboardService);
  currentTripService = inject(CurrentTripService);
  
  destroyRef = inject(DestroyRef);

  tripData: DashboardTripDto | null = null;

  tripIsCurrent: boolean = false;

  ngOnInit(): void {
    this.selectedTripId$.pipe(
      switchMap(tripId => {

        if (!tripId) {
          return of(null);
        }
        return this.dashboardService.getDashboardTripDto(tripId);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(trip => {
      this.tripData = trip;
    } 
    );
  } 
}
