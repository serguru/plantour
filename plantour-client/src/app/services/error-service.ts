import { Injectable, ApplicationRef, inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type AppError = {
  message: string;
  stack?: string;
  code?: string | number;
  context?: any;
  level?: 'error' | 'warn' | 'info' | 'success' | string;
  timestamp?: string;
};

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSubject = new Subject<AppError>();
  readonly errors$: Observable<AppError> = this.errorSubject.asObservable();

  // in zone-less apps we may need to manually trigger change detection
  private appRef = inject(ApplicationRef);

  push(err: AppError) {
    // normalize
    const payload: AppError = {
      timestamp: new Date().toISOString(),
      level: err.level ?? 'error',
      ...err,
    };

    this.errorSubject.next(payload);

    // Force change detection when zone.js is not present.
    // ApplicationRef.tick() is an expensive full tick but simple and reliable.
    // Optionally replace with finer-grained markForCheck or signals if you prefer.
    try {
      this.appRef.tick();
    } catch {
      // ignore if not available
    }
  }
}
