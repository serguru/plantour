import { Component, inject, OnDestroy, signal } from '@angular/core';

import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { LoadingService } from '../../services/loading-service';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading-component.html',
  styleUrl: './loading-component.scss',
})
export class LoadingComponent implements OnDestroy {
  private loadingService = inject(LoadingService);
  private destroy$ = new Subject<void>();

  // Controls whether the overlay is in the DOM
  shown = signal(false);
  // Controls the .visible CSS class (triggers opacity transition)
  visible = signal(false);

  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.loadingService.loading$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      if (loading) {
        if (this.hideTimer) {
          clearTimeout(this.hideTimer);
          this.hideTimer = null;
        }
        // Show overlay after 200ms delay
        this.showTimer = setTimeout(() => {
          this.shown.set(true);
          // One tick after DOM render to trigger CSS transition
          setTimeout(() => this.visible.set(true), 10);
        }, 200);
      } else {
        if (this.showTimer) {
          clearTimeout(this.showTimer);
          this.showTimer = null;
        }
        // Fade out immediately, remove from DOM after 500ms
        this.visible.set(false);
        this.hideTimer = setTimeout(() => this.shown.set(false), 500);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.showTimer) clearTimeout(this.showTimer);
    if (this.hideTimer) clearTimeout(this.hideTimer);
  }
}
