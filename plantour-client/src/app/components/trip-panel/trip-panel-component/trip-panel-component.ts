import { Component, inject, Input, OnInit } from '@angular/core';
import { TripService, TripStatDto } from '../../../services/trip-service';

@Component({
  selector: 'app-trip-panel',
  imports: [],
  templateUrl: './trip-panel-component.html',
  styleUrl: './trip-panel-component.scss',
})
export class TripPanelComponent implements OnInit {
  @Input() tripId!: string;

  tripService = inject(TripService);
  
  tripStatDto: TripStatDto | null = null;

  get tripUrl(): string {
    return '/trips';
  }

  ngOnInit(): void {
    this.tripService.getTripStatById(this.tripId).subscribe((response) => {
      this.tripStatDto = response;
    });
    
  }
}

