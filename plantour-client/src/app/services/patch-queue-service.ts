import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { JsonPatchOperation } from './json-patch-operation';

export type PatchStatus = 'pending' | 'processing' | 'sent' | 'error';

export interface PatchQueueItem {
  tourId: string;
  operations: JsonPatchOperation[];
  status: PatchStatus;
  createdAt: Date;
  lastError?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatchQueueService {
  private readonly apiUrl = environment.apiUrl;

  private readonly queue: PatchQueueItem[] = [];
  private readonly queueSubject = new BehaviorSubject<PatchQueueItem[]>([]);
  private processing = false;

  constructor(private readonly http: HttpClient) {}

  /** Подписка на состояние очереди (для дебага/ UI) */
  get queue$() {
    return this.queueSubject.asObservable();
  }

  /** Добавить патч в очередь */
  enqueueTourPatch(tourId: string, operations: JsonPatchOperation[]): void {
    if (!operations || operations.length === 0) {
      return;
    }

    const item: PatchQueueItem = {
      tourId,
      operations,
      status: 'pending',
      createdAt: new Date()
    };

    this.queue.push(item);
    this.emitQueue();

    // немедленно попробовать отправить
    this.processNext();
  }

  private emitQueue(): void {
    this.queueSubject.next([...this.queue]);
  }

  private processNext(): void {
    if (this.processing) {
      return;
    }

    const next = this.queue.find(q => q.status === 'pending');
    if (!next) {
      return;
    }

    this.processing = true;
    next.status = 'processing';
    this.emitQueue();

    console.log('PatchQueueService: sending patch', next);

    this.http.post(
      `${this.apiUrl}/api/tours/${next.tourId}/patch`,
      next.operations
    ).subscribe({
      next: () => {
        next.status = 'sent';
        this.processing = false;
        this.emitQueue();
        console.log('PatchQueueService: patch sent successfully', next);
        this.processNext();
      },
      error: (err) => {
        console.error('PatchQueueService: error sending patch', err);

        const status = err?.status;

        // 1) временные ошибки: сеть, 5xx → retry
        if (status === 0 || (status >= 500 && status < 600)) {
          next.status = 'pending';
          next.lastError = 'Transient error, will retry';
          this.processing = false;
          this.emitQueue();

          setTimeout(() => this.processNext(), 3000);
          return;
        }

        // 2) конфликт версий
        if (status === 409) {
          next.status = 'error';
          next.lastError = 'Version conflict reported by server (409). Patch will not be retried.';
          this.processing = false;
          this.emitQueue();
          return;
        }

        // 3) плохой патч / некорректные данные: 400/422
        if (status === 400 || status === 422) {
          next.status = 'error';
          next.lastError = 'Invalid patch or bad request (400/422). Patch is considered dead.';
          this.processing = false;
          this.emitQueue();
          return;
        }

        // 4) прочие ошибки
        next.status = 'error';
        next.lastError = err?.message ?? 'Unknown error';
        this.processing = false;
        this.emitQueue();
      }
    });
  }
}
