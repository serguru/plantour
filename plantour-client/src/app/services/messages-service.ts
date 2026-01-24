import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';

export type DialogType = 'yes-no-cancel' | 'ok-cancel' | 'info';
export type DialogResult = 'yes' | 'no' | 'ok' | 'cancel';

export interface DialogConfig {
  title?: string;
  message?: string;
  yesLabel?: string;
  noLabel?: string;
  okLabel?: string;
  cancelLabel?: string;
}

export interface DialogState extends DialogConfig {
  visible: boolean;
  type: DialogType;
}

// TODO: adjust messages colors and fonts 
@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  // State for the modal dialog
  private dialogStateSubject = new BehaviorSubject<DialogState | null>(null);
  dialogState$ = this.dialogStateSubject.asObservable();

  private dialogResolver: ((result: DialogResult) => void) | null = null;

  constructor(private messageService: MessageService) {}

  // -------- TOASTS --------

  showInfo(summary: string, detail?: string) {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: 4000
    });
  }

  showWarning(summary: string, detail?: string) {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: 5000
    });
  }

  showError(summary: string, detail?: string) {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 7000
    });
  }

  // -------- MODAL DIALOGS --------

  openYesNoCancel(config: DialogConfig): Promise<DialogResult> {
    return this.openDialog({
      ...config,
      type: 'yes-no-cancel'
    });
  }

  openOkCancel(config: DialogConfig): Promise<DialogResult> {
    return this.openDialog({
      ...config,
      type: 'ok-cancel'
    });
  }

  openInfo(config: DialogConfig): Promise<DialogResult> {
    return this.openDialog({
      ...config,
      type: 'info'
    });
  }

  private openDialog(cfg: { type: DialogType } & DialogConfig): Promise<DialogResult> {
    // Close any existing dialog first
    this.dialogStateSubject.next({
      visible: true,
      type: cfg.type,
      title: cfg.title ?? 'Confirmation',
      message: cfg.message ?? '',
      yesLabel: cfg.yesLabel,
      noLabel: cfg.noLabel,
      okLabel: cfg.okLabel,
      cancelLabel: cfg.cancelLabel
    });

    return new Promise<DialogResult>((resolve) => {
      this.dialogResolver = resolve;
    });
  }

  resolveDialog(result: DialogResult) {
    if (this.dialogResolver) {
      this.dialogResolver(result);
      this.dialogResolver = null;
    }
    this.dialogStateSubject.next(null);
  }

  cancelDialog() {
    // Called on Esc or when dialog is closed
    this.resolveDialog('cancel');
  }
}
