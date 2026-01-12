import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, Observable, of, switchMap } from 'rxjs';
import { UsersService } from './users-service';
import { TripService } from './trip-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class CurrentTripService {

  usersService = inject(UsersService);
  tripService = inject(TripService);

    private currentTripIdSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    currentTripId$: Observable<string | null> = this.currentTripIdSubject.asObservable();
    public updateCurrentTripId(tripId: string | null): void {
        this.currentTripIdSubject.next(tripId);
    }
    currentTripDto$ = combineLatest([this.currentTripId$, this.usersService.currentUser$]).pipe(
        distinctUntilChanged(),
        switchMap(([tripId, currentUser]) => {
            if (!tripId || !this.usersService.isAuthenticated) {
                return of(null);
            }
            return this.tripService.getById(tripId).pipe(
                catchError(() => of(null))
            )
        }),
        takeUntilDestroyed()
    );

    private currentTripVisibleSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(localStorage.getItem('toolbar-showTripText') === 'true');
    currentTripVisible$: Observable<boolean> = this.currentTripVisibleSubject.asObservable();
    public updateCurrentTripVisible(visible: boolean): void {
        this.currentTripVisibleSubject.next(visible);
        localStorage.setItem('toolbar-showTripText', visible ? 'true' : 'false')
    }
}
