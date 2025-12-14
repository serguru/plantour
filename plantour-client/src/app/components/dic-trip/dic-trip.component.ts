import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { TripService, TripDto } from '../../services/trip-service';
import { catchError, finalize } from 'rxjs';

@Component({
    selector: 'app-dic-trip',
    standalone: true,
    imports: [CommonModule, FormsModule, Select],
    templateUrl: './dic-trip.component.html',
    styleUrls: ['./dic-trip.component.scss'],
})
export class DicTripComponent implements OnInit {
    loading = false;
    private tripService = inject(TripService);

    trips: TripDto[] = [];
    selectedTripId = signal<string | null>(null);
    selectedTrip = computed<TripDto | null>(() => {
        const id = this.selectedTripId();
        return id ? this.trips.find(t => t.id === id) ?? null : null;
    });

    @Output() selectedTripChanged = new EventEmitter<TripDto | null>();

    ngOnInit() {
        this.loading = true;

        this.tripService.getAll()
            .pipe(
                catchError(error => {
                    this.trips = [];
                    this.selectedTripId.set(null);
                    this.selectedTripChanged.emit(null);
                    throw error;
                }),
                finalize(() => { 
                    this.loading = false; 
                })
            )
            .subscribe(trips => {
                this.trips = trips;
                if (this.trips.length === 0) {
                    this.selectedTripId.set(null);
                    this.selectedTripChanged.emit(null);
                    return;
                }
                this.selectedTripId.set(this.trips[0].id);
                this.selectedTripChanged.emit(this.selectedTrip());
            });
    }

    onSelectedTripChange(id: string | null) {
        this.selectedTripId.set(id);
        this.selectedTripChanged.emit(this.selectedTrip());
    }
}