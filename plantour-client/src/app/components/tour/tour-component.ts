import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TourService, TourDto } from '../../services/tour-service';
import { PatchQueueService } from '../../services/patch-queue-service';
import { JsonPatchOperation } from '../../services/json-patch-operation';

/** Вычисление патча для простого объекта {id, name} */
function computeTourPatch(original: TourDto, updated: TourDto): JsonPatchOperation[] {
  const ops: JsonPatchOperation[] = [];

  // id, как правило, не меняется, но оставим на всякий случай
  if (original.id !== updated.id) {
    ops.push({
      op: original.id === undefined ? 'add' : 'replace',
      path: '/id',
      value: updated.id
    });
  }

  if (original.name !== updated.name) {
    ops.push({
      op: original.name === undefined ? 'add' : 'replace',
      path: '/name',
      value: updated.name
    });
  }

  return ops;
}

@Component({
  selector: 'app-tour-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tour-component.html',
  styleUrl: './tour-component.scss'
})
export class TourComponent implements OnInit {
  /** Id тура, по умолчанию — заданный GUID */
  @Input() id: string = 'ea2e4d3b-6759-4be6-a643-bcf321b7a04f';

  private readonly tourService = inject(TourService);
  private readonly patchQueue = inject(PatchQueueService);
  private readonly fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    id: this.fb.nonNullable.control('', { validators: [Validators.required] }),
    name: this.fb.nonNullable.control('', { validators: [Validators.required] })
  });

  /** Исходный JSON тура для сравнения */
  private originalTour: TourDto | null = null;

  /** Для отображения состояния очереди в UI */
  queueState = signal<any[]>([]);

  ngOnInit(): void {
    // Подписка на очередь — чтобы видеть, что она реально работает
    this.patchQueue.queue$.subscribe(items => {
      this.queueState.set(items);
    });

    if (!this.id) {
      console.warn('TourComponent: id is not set');
      return;
    }

    this.loadTour();
  }

  private loadTour(): void {
    this.tourService.getTour(this.id).subscribe({
      next: (tour) => {
        this.originalTour = tour;
        this.form.patchValue({
          id: tour.id,
          name: tour.name
        });
      },
      error: (err) => {
        console.error('Failed to load tour', err);
      }
    });
  }

  submit(): void {
    if (!this.form.valid || !this.originalTour) {
      return;
    }

    const updated: TourDto = {
      id: this.originalTour.id, // id в форме disabled, берём из original
      name: this.form.get('name')!.value ?? ''
    };

    const patch = computeTourPatch(this.originalTour, updated);

    if (patch.length === 0) {
      console.log('TourComponent: no changes detected, nothing to enqueue');
      return;
    }

    console.log('TourComponent: computed patch', patch);

    // Отправляем патч в очередь
    this.patchQueue.enqueueTourPatch(this.originalTour.id, patch);
  }
}
