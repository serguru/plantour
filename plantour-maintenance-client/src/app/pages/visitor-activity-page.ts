import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DateTime, Duration } from 'luxon';
import { finalize } from 'rxjs';
import { BrnDialogService } from '@spartan-ng/brain/dialog';
import { ApiErrorResponse } from '../models/auth.models';
import { VisitorActivityPeriod } from '../models/visitor-activity-period.models';
import { VisitorActivityRowDto } from '../models/visitor-activity.models';
import { VisitorActivityPeriodDialogComponent } from '../components/visitor-activity-period-dialog/visitor-activity-period-dialog';
import { VisitorActivityService } from '../services/visitor-activity-service';

@Component({
  selector: 'app-visitor-activity-page',
  templateUrl: './visitor-activity-page.html',
  styleUrl: './visitor-activity-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisitorActivityPage implements OnInit {
  private readonly dialogService = inject(BrnDialogService);
  private readonly visitorActivityService = inject(VisitorActivityService);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly rows = signal<VisitorActivityRowDto[]>([]);
  protected readonly period = signal<VisitorActivityPeriod>(getDefaultPeriod());
  protected readonly periodLabel = computed(() => formatPeriod(this.period()));
  protected readonly durationLabel = computed(() => formatDuration(this.period()));

  ngOnInit(): void {
    this.loadRows();
  }

  protected openPeriodDialog(): void {
    if (this.isLoading()) {
      return;
    }

    const dialogRef = this.dialogService.open(
      VisitorActivityPeriodDialogComponent,
      undefined,
      { period: this.period() },
      {
        ariaLabel: 'Visitor activity period',
        backdropClass: 'period-dialog-backdrop',
        panelClass: 'period-dialog-panel'
      }
    );

    dialogRef.closed$.subscribe((result) => {
      if (!result) {
        return;
      }

      this.period.set(result);
      this.loadRows();
    });
  }

  protected trackByRow(_index: number, row: VisitorActivityRowDto): string {
    return `${row.day}:${row.ip}`;
  }

  private loadRows(): void {
    const { fromUtcIso, toUtcIso } = this.period();

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.visitorActivityService.getRows(fromUtcIso, toUtcIso).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (rows) => {
        this.rows.set(rows);
      },
      error: (error: { error?: ApiErrorResponse }) => {
        this.rows.set([]);
        this.errorMessage.set(error.error?.message ?? 'Unable to load visitor activity.');
      }
    });
  }
}

function getDefaultPeriod(): VisitorActivityPeriod {
  const toUtc = DateTime.utc();
  const fromUtc = toUtc.minus({ days: 6 }).startOf('day');

  return {
    fromUtcIso: toIsoValue(fromUtc),
    toUtcIso: toIsoValue(toUtc)
  };
}

function formatPeriod(period: VisitorActivityPeriod): string {
  const from = DateTime.fromISO(period.fromUtcIso, { zone: 'utc' }).toLocal();
  const to = DateTime.fromISO(period.toUtcIso, { zone: 'utc' }).toLocal();

  return `${from.toFormat('dd LLL yyyy, HH:mm')} - ${to.toFormat('dd LLL yyyy, HH:mm')}`;
}

function formatDuration(period: VisitorActivityPeriod): string {
  const from = DateTime.fromISO(period.fromUtcIso, { zone: 'utc' });
  const to = DateTime.fromISO(period.toUtcIso, { zone: 'utc' });
  const duration = to.diff(from, ['days', 'hours', 'minutes']).shiftTo('days', 'hours', 'minutes');

  return toDurationLabel(duration);
}

function toDurationLabel(duration: Duration): string {
  const days = Math.floor(duration.days);
  const hours = Math.floor(duration.hours);
  const minutes = Math.floor(duration.minutes);
  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }

  if (hours > 0 || parts.length > 0) {
    parts.push(`${hours}h`);
  }

  parts.push(`${minutes}m`);
  return parts.join(' ');
}

function toIsoValue(dateTime: DateTime): string {
  return dateTime.toISO({ suppressMilliseconds: true }) ?? '';
}