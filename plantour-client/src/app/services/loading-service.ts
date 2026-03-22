import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private activeRequests = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable().pipe(distinctUntilChanged());

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
}
