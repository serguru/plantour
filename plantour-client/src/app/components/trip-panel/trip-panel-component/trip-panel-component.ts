import { Component, inject, Input, OnInit } from '@angular/core';
import { TripService, TripDto } from '../../../services/trip-service';
import { AppService } from '../../../services/app-service';

@Component({
  selector: 'app-trip-panel',
  imports: [],
  templateUrl: './trip-panel-component.html',
  styleUrl: './trip-panel-component.scss',
})
export class TripPanelComponent implements OnInit {
  appService = inject(AppService);
  @Input() tripId!: string;

  get hideTripPanel(): boolean {
    return false;
  }

  tripService = inject(TripService);
  
  tripDto: TripDto | null = null;

  get tripUrl(): string {
    return '/trips';
  }

  ngOnInit(): void {
    this.tripService.getById(this.tripId).subscribe((response) => {
      this.tripDto = response;
    });
    
  }
}

