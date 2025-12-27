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
}
