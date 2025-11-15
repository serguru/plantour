import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { ErrorService, AppError } from '../../error-service';
import { Subscription } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppError, ErrorService } from '../../services/error-service';

@Component({
  selector: 'app-error-toast',
  standalone: true,
  imports: [CommonModule, ToastModule],
  templateUrl: './error-toast-component.html',
  styleUrls: ['./error-toast-component.scss'],
  providers: [MessageService] // local MessageService for toasts
})
export class ErrorToastComponent implements OnDestroy {
  private sub: Subscription;
  // keep last error as a signal if you want to bind to template
  lastError = signal<AppError | null>(null);

  constructor(private errorService: ErrorService, private messageService: MessageService) {
    this.sub = this.errorService.errors$.subscribe((err) => this.onError(err));
  }

  private onError(err: AppError) {
    this.lastError.set(err);
    // push to PrimeNG message service
    this.messageService.add({
      severity: err.level ?? 'error',
      summary: err.code ? `Error ${err.code}` : 'Error',
      detail: err.message,
      life: 8000,
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
