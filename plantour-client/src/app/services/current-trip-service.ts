import { effect, inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, Observable, of, switchMap } from 'rxjs';
import { UsersService } from './users-service';
import { TripService } from './trip-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { LocalStorageService } from './local-storage-service';

@Injectable({
    providedIn: 'root',
})
export class CurrentTripService {
    private readonly currentTripStorageComponentId = 'trips';
    private readonly currentTripStorageKey = 'selectedId';
    private readonly currentTripVisibleStorageKey = 'toolbar-showTripText';

    usersService = inject(UsersService);
    tripService = inject(TripService);
    localStorageService = inject(LocalStorageService);

    constructor() {
        effect(() => {
            if (!this.usersService.isAuthenticatedSignal()) {
                return;
            }

            const storedVisibility = this.getStoredCurrentTripVisibility();
            if (storedVisibility === null) {
                this.updateCurrentTripVisible(true);
            }
        });
    }

    private currentTripIdSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(
        this.localStorageService.getComponentKey(this.currentTripStorageComponentId, this.currentTripStorageKey)
    );
    currentTripId$: Observable<string | null> = this.currentTripIdSubject.asObservable();
    
    private refreshSubject = new BehaviorSubject<void>(undefined);
    
    public updateCurrentTripId(tripId: string | null): void {
        this.localStorageService.setComponentKey(this.currentTripStorageComponentId, this.currentTripStorageKey, tripId);
        this.currentTripIdSubject.next(tripId);
    }

    public refreshCurrentTrip(): void {
        this.refreshSubject.next();
    }

    currentTripDto$ =  combineLatest([this.currentTripId$,this.refreshSubject]).pipe(
        distinctUntilChanged(),
        switchMap(([tripId]) => {
            if (!tripId || !this.usersService.isAuthenticatedSignal()) {
                return of(null);
            }
            return this.tripService.getById(tripId).pipe(
                catchError(() => of(null))
            )
        }),
        takeUntilDestroyed()
    );

    currentTripDtoSignal = toSignal(this.currentTripDto$);
    currentTripIdSignal = toSignal(this.currentTripId$);

    private currentTripVisibleSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.getStoredCurrentTripVisibility() ?? false);
    currentTripVisible$: Observable<boolean> = this.currentTripVisibleSubject.asObservable();

    public updateCurrentTripVisible(visible: boolean): void {
        this.currentTripVisibleSubject.next(visible);
        this.localStorageService.setItem(this.currentTripVisibleStorageKey, visible);
    }

    private getStoredCurrentTripVisibility(): boolean | null {
        const value = this.localStorageService.getItem(this.currentTripVisibleStorageKey);
        return typeof value === 'boolean' ? value : null;
    }

}
