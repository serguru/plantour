import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DateTime } from 'luxon';
import { BrnDialogClose, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { VisitorActivityPeriod } from '../../models/visitor-activity-period.models';

interface VisitorActivityPeriodDialogContext {
  period: VisitorActivityPeriod;
  close: (result?: VisitorActivityPeriod) => void;
}

const LOCAL_DATE_TIME_FORMAT = "yyyy-LL-dd'T'HH:mm";

@Component({
  selector: 'app-visitor-activity-period-dialog',
  imports: [ReactiveFormsModule, BrnDialogClose],
  templateUrl: './visitor-activity-period-dialog.html',
  styleUrl: './visitor-activity-period-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisitorActivityPeriodDialogComponent {
  private readonly dialogContext = injectBrnDialogContext<VisitorActivityPeriodDialogContext>();
  private readonly formBuilder = new FormBuilder();

  protected readonly periodForm = this.formBuilder.nonNullable.group({
    from: [toLocalInputValue(this.dialogContext.period.fromUtcIso), [Validators.required]],
    to: [toLocalInputValue(this.dialogContext.period.toUtcIso), [Validators.required]]
  }, { validators: [dateRangeValidator()] });

  protected submit(): void {
    if (this.periodForm.invalid) {
      this.periodForm.markAllAsTouched();
      return;
    }

    const { from, to } = this.periodForm.getRawValue();
    this.dialogContext.close({
      fromUtcIso: toUtcIsoString(from),
      toUtcIso: toUtcIsoString(to)
    });
  }
}

function dateRangeValidator(): ValidatorFn {
  return (control): ValidationErrors | null => {
    const fromValue = control.get('from')?.value;
    const toValue = control.get('to')?.value;

    if (!fromValue || !toValue) {
      return null;
    }

    return toUtcDateTime(fromValue) <= toUtcDateTime(toValue)
      ? null
      : { invalidRange: true };
  };
}

function toLocalInputValue(utcIso: string): string {
  return DateTime.fromISO(utcIso, { zone: 'utc' }).toLocal().toFormat(LOCAL_DATE_TIME_FORMAT);
}

function toUtcIsoString(localValue: string): string {
  return toUtcDateTime(localValue).toISO({ suppressMilliseconds: true }) ?? '';
}

function toUtcDateTime(localValue: string): DateTime {
  return DateTime.fromFormat(localValue, LOCAL_DATE_TIME_FORMAT, { zone: 'local' }).toUTC();
}