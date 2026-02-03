import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AppButton } from '../../button/button-component';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { ComponentService } from '../../../services/component-service';
import { TripDto, TripService } from '../../../services/trip-service';
import { CurrentTripService } from '../../../services/current-trip-service';
import { map, of, startWith, switchMap, withLatestFrom } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DashboardService, DashboardTripDto } from '../../../services/dashboard-service';


// TODO: consider replacing OnInit with signal-based approach in other components as well
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
    DividerModule,
    AppButton
  ],
  templateUrl: './trip-summary-component.html',
  styleUrl: './trip-summary-component.scss',
})
export class TripSummaryComponent implements OnInit {

  dashboardService = inject(DashboardService);
  currentTripService = inject(CurrentTripService);
  
  destroyRef = inject(DestroyRef);

  tripData: DashboardTripDto | null = null;

  tripIsCurrent: boolean = false;

  ngOnInit(): void {
    this.currentTripService.currentTripDto$.pipe(
      switchMap(trip => {
        this.tripIsCurrent = trip !== null;
        return this.dashboardService.getDashboardTripDto(trip ? trip.id : undefined);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(trip => {
      this.tripData = trip;
    } 
    );
  } 
}
