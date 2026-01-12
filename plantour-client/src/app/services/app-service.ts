import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AppService {
    routeActivated: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    routeActivated$: Observable<any> = this.routeActivated.asObservable();

    routeDeActivated: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    routeDeActivated$: Observable<any> = this.routeDeActivated.asObservable();
}
