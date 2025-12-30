import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { TripDto, TripService } from './trip-service';

@Injectable({
    providedIn: 'root',
})
export class AppService {

    tripService = inject(TripService);

    constructor() {
        const tripId = localStorage.getItem('trips-selectedId');
        if (!tripId) {
            this.tripSelected.next(null);
            return;
        }

        this.tripService.getById(tripId).pipe(
            tap((trip: TripDto) => {
                this.tripSelected.next(trip);
            })
        ).subscribe();

    }

    routeActivated: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    routeActivated$: Observable<any> = this.routeActivated.asObservable();

    routeDeActivated: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    routeDeActivated$: Observable<any> = this.routeDeActivated.asObservable();

    tripSelected: BehaviorSubject<TripDto | null> = new BehaviorSubject<TripDto | null>(null);
    tripSelected$: Observable<TripDto | null> = this.tripSelected.asObservable()


    saveToLocalStorage(componentId: string | null, selectedId: string | null) {
        if (!componentId) {
            return;
        }
        if (selectedId) {
            localStorage.setItem(`${componentId}-selectedId`, String(selectedId));
        } else {
            localStorage.removeItem(`${componentId}-selectedId`);
        }
    }

    getFromLocalStorage(componentId: string | null) {
        if (!componentId) {
            return null;
        }
        return localStorage.getItem(`${componentId}-selectedId`);
    }
}
