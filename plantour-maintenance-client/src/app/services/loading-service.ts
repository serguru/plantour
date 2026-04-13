import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = 0;
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly loading$ = this.loadingSubject.asObservable().pipe(distinctUntilChanged());

  start(): void {
    if (++this.activeRequests === 1) {
      this.loadingSubject.next(true);
    }
  }

  stop(): void {
    if (--this.activeRequests <= 0) {
      this.activeRequests = 0;
      this.loadingSubject.next(false);
    }
  }

  reset(): void {
    this.activeRequests = 0;
    this.loadingSubject.next(false);
  }
}