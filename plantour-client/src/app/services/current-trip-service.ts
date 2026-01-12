import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, Observable, of, switchMap } from 'rxjs';
import { UsersService } from './users-service';
import { TripService } from './trip-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocalStorageService } from './local-storage-service';

@Injectable({
    providedIn: 'root',
})
export class CurrentTripService {

    usersService = inject(UsersService);
    tripService = inject(TripService);
    localStorageService = inject(LocalStorageService);

    private currentTripIdSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    currentTripId$: Observable<string | null> = this.currentTripIdSubject.asObservable();
    public updateCurrentTripId(tripId: string | null): void {
        this.currentTripIdSubject.next(tripId);
    }
    currentTripDto$ = combineLatest([this.currentTripId$, this.usersService.user$]).pipe(
        distinctUntilChanged(),
        switchMap(([tripId, user]) => {
            if (!tripId || !this.usersService.isAuthenticatedSignal()) {
                return of(null);
            }
            return this.tripService.getById(tripId).pipe(
                catchError(() => of(null))
            )
        }),
        takeUntilDestroyed()
    );

    private currentTripVisibleSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.localStorageService.getItem('toolbar-showTripText'));
    currentTripVisible$: Observable<boolean> = this.currentTripVisibleSubject.asObservable();
    public updateCurrentTripVisible(visible: boolean): void {
        this.currentTripVisibleSubject.next(visible);
        this.localStorageService.setItem('toolbar-showTripText', visible);
    }
}
