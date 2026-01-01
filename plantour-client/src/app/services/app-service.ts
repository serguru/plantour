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

    private tripSelected: BehaviorSubject<TripDto | null> = new BehaviorSubject<TripDto | null>(null);
    tripSelected$: Observable<TripDto | null> = this.tripSelected.asObservable();
    public updateTripSelected(trip: TripDto | null): void {
        this.tripSelected.next(trip);
    }
    public get isTripSelected() {
        return this.tripSelected.getValue() !== null;
    }
    public tripSelectedValue() {
        return this.tripSelected.getValue();
    }

    private tripTextVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(localStorage.getItem('toolbar-showTripText') === 'true');
    tripTextVisible$: Observable<boolean> = this.tripTextVisible.asObservable();

    public updateTripTextVisible(visible: boolean): void {
        this.tripTextVisible.next(visible);
        localStorage.setItem('toolbar-showTripText', visible ? 'true' : 'false') 
    }

    getTripTextVisible(): boolean {
        return this.tripTextVisible.getValue();
    }


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

    resetState(): void {
        this.updateTripSelected(null);
        this.updateTripTextVisible(false);
    }
}
