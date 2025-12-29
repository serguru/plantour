import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { TripDto } from './trip-service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  routeActivated: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  routeActivated$: Observable<any> = this.routeActivated.asObservable();

  routeDeActivated: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  routeDeActivated$: Observable<any> = this.routeDeActivated
    .pipe(
      tap(() => {
        this.tripSelected.next(null);
      })
    );

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
