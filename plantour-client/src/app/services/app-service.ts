import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, filter, map, Observable, Subject, tap } from 'rxjs';
import { TripDto, TripService } from './trip-service';
import { TripPackageDto } from './trip-package-service';
import { NavigationEnd, Router } from '@angular/router';

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
    routeActivated$: Observable<any> = this.routeActivated.pipe(
        tap(activated => {
            this.currentComponentIdSubject.next(activated?.componentId || null);        
        })
    )

    routeDeActivated: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    routeDeActivated$: Observable<any> = this.routeDeActivated.pipe(
        tap(() => {
            this.currentComponentIdSubject.next(null);        
        })
    )

    currentComponentIdSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    currentComponentId$: Observable<string | null> = this.currentComponentIdSubject.asObservable();

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

    private packSelected: BehaviorSubject<TripPackageDto | null> = new BehaviorSubject<TripPackageDto | null>(null);
    packSelected$: Observable<TripPackageDto | null> = this.packSelected.asObservable();

    public updatePackSelected(pack: TripPackageDto | null): void {
        this.packSelected.next(pack);
    }
    public get isPackSelected() {
        return this.packSelected.getValue() !== null;
    }
    public packSelectedValue() {
        return this.packSelected.getValue();
    }
}
