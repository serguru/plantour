import { Component, inject, OnDestroy, signal } from '@angular/core';

import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ClientSettingsService } from '../../services/client-settings-service';
import { MessagesService } from '../../services/messages-service';
import { LoadingService } from '../../services/loading-service';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading-component.html',
  styleUrl: './loading-component.scss',
})
export class LoadingComponent implements OnDestroy {
  private readonly loadingService = inject(LoadingService);
  private readonly clientSettingsService = inject(ClientSettingsService);
  private readonly messagesService = inject(MessagesService);
  private destroy$ = new Subject<void>();

  // Controls whether the overlay is in the DOM
  shown = signal(false);
  // Controls the .visible CSS class (triggers opacity transition)
  visible = signal(false);

  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private timeoutTimer: ReturnType<typeof setTimeout> | null = null;

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
        this.clearTimeoutCountdown();
        // Show overlay after 200ms delay
        this.showTimer = setTimeout(() => {
          this.showTimer = null;
          this.shown.set(true);
          this.startTimeoutCountdown();
          // One tick after DOM render to trigger CSS transition
          setTimeout(() => this.visible.set(true), 10);
        }, 200);
      } else {
        if (this.showTimer) {
          clearTimeout(this.showTimer);
          this.showTimer = null;
        }
        // Fade out immediately, remove from DOM after 500ms
        this.clearTimeoutCountdown();
        this.visible.set(false);
        this.hideTimer = setTimeout(() => {
          this.hideTimer = null;
          this.shown.set(false);
        }, 500);
      }
    });
  }

  private startTimeoutCountdown(): void {
    const timeoutMs = this.clientSettingsService.globalSpinnerTimeoutSec() * 1000;
    this.timeoutTimer = setTimeout(() => {
      this.timeoutTimer = null;
      this.visible.set(false);
      this.shown.set(false);
      this.loadingService.reset();
      this.messagesService.showWarning('Spinner timeout exceeded');
    }, timeoutMs);
  }

  private clearTimeoutCountdown(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.showTimer) clearTimeout(this.showTimer);
    if (this.hideTimer) clearTimeout(this.hideTimer);
    if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
  }
}
