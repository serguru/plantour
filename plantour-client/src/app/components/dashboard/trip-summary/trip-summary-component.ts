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
import { map, of, startWith, switchMap } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';


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
  tripService = inject(TripService);
  currentTripService = inject(CurrentTripService);
  componentService = inject(ComponentService);
  destroyRef = inject(DestroyRef);

  trip: TripDto | null = null;
  tripIsCurrent = true;

  ngOnInit(): void {

    this.currentTripService.currentTripDto$.pipe(
      switchMap(trip => {
        if (trip) {
  this.tripIsCurrent = true;
          return of(trip);
        }
        this.tripIsCurrent = false;
        return this.tripService.getDashboardTrip();
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(trip => {
      this.trip = trip;
    } 
    );
  } 



}
