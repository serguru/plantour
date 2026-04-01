import { Component, computed, EventEmitter, OnInit, Output, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { formatDate } from '../../helpers/utils';
import { LocalStorageService } from '../../services/local-storage-service';

@Component({
  selector: 'app-deadline',
  standalone: true,
  imports: [FormsModule, DatePicker],
  templateUrl: './deadline-component.html',
  styleUrl: './deadline-component.scss',
})
export class DeadlineComponent implements OnInit {
  componentId = input.required<string>();
  label = input('Deadline at');
  defaultDays = input(3);

  @Output() deadlineAtChange = new EventEmitter<Date | null>();

  private localStorageService = inject(LocalStorageService);

  deadlineAt = signal<Date | null>(null);

  deadlinePreview = computed(() => {
    const deadline = this.deadlineAt();
    if (!deadline) {
      return '';
    }

    return formatDate(deadline);
  });

  deadlineInvalid = computed(() => {
    const deadline = this.deadlineAt();
    return !deadline || deadline.getTime() <= Date.now();
  });

  ngOnInit(): void {
    const deadline = this.restoreDeadline();
    this.deadlineAt.set(deadline);
    this.deadlineAtChange.emit(deadline);
  }

  onDeadlineAtChange(value: Date | null): void {
    const deadline = this.normalizeDeadline(value);
    this.deadlineAt.set(deadline);
    this.persistDeadline(deadline);
    this.deadlineAtChange.emit(deadline);
  }

  private restoreDeadline(): Date {
    const savedDeadlineRaw = this.localStorageService.getComponentKey(this.componentId(), 'deadlineAt');
    const savedDeadline = this.normalizeDeadline(savedDeadlineRaw ? new Date(savedDeadlineRaw) : null);

    if (savedDeadline && savedDeadline.getTime() > Date.now()) {
      this.localStorageService.setComponentKey(this.componentId(), 'deadlineDays', null);
      return savedDeadline;
    }

    const legacyDeadlineDays = this.localStorageService.getComponentKey(this.componentId(), 'deadlineDays');
    const deadline = this.createDeadlineFromDays(legacyDeadlineDays ? Number(legacyDeadlineDays) : this.defaultDays());
    this.persistDeadline(deadline);
    this.localStorageService.setComponentKey(this.componentId(), 'deadlineDays', null);
    return deadline;
  }

  private persistDeadline(value: Date | null): void {
    this.localStorageService.setComponentKey(this.componentId(), 'deadlineAt', value?.toISOString() ?? null);
  }

  private createDeadlineFromDays(days: number): Date {
    const safeDays = Number.isFinite(days) ? Math.max(0, Math.trunc(days)) : this.defaultDays();
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + safeDays);
    deadline.setHours(12, 0, 0, 0);
    return deadline;
  }

  private normalizeDeadline(value: Date | null): Date | null {
    if (!value || Number.isNaN(value.getTime())) {
      return null;
    }

    return new Date(value);
  }
}