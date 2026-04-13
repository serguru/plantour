import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { LoadingService } from '../../services/loading-service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading-component.html',
  styleUrl: './loading-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingComponent implements OnDestroy {
  private readonly loadingService = inject(LoadingService);
  private readonly destroy$ = new Subject<void>();

  protected readonly shown = signal(false);
  protected readonly visible = signal(false);

  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.loadingService.loading$
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((loading) => {
        if (loading) {
          if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
          }

          this.showTimer = setTimeout(() => {
            this.showTimer = null;
            this.shown.set(true);
            setTimeout(() => this.visible.set(true), 10);
          }, 200);

          return;
        }

        if (this.showTimer) {
          clearTimeout(this.showTimer);
          this.showTimer = null;
        }

        this.visible.set(false);
        this.hideTimer = setTimeout(() => {
          this.hideTimer = null;
          this.shown.set(false);
        }, 250);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.showTimer) {
      clearTimeout(this.showTimer);
    }

    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
  }
}