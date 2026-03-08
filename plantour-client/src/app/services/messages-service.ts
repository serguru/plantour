import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';

export type DialogType = 'yes-no-cancel' | 'ok-cancel' | 'ok-cancel-email' | 'info';
export type DialogResult = 'yes' | 'no' | 'ok' | 'cancel';

export interface EmailDialogResult {
  result: DialogResult;
  email?: string;
}

export type EmailOkHandler = (email: string) => Promise<string | null> | string | null;
export type EmailOkErrorHandler = (error: unknown, email: string) => Promise<string | null> | string | null;

export interface DialogConfig {
  title?: string;
  message?: string;
  yesLabel?: string;
  noLabel?: string;
  okLabel?: string;
  cancelLabel?: string;
}

export interface EmailDialogConfig extends DialogConfig {
  email?: string;
  emailPlaceholder?: string;
  onOkAsync?: EmailOkHandler;
  onOkError?: EmailOkErrorHandler;
}

export interface DialogState extends DialogConfig {
  visible: boolean;
  type: DialogType;
  email?: string;
  emailPlaceholder?: string;
  onOkAsync?: EmailOkHandler;
  onOkError?: EmailOkErrorHandler;
}

// TODO: adjust messages colors and fonts 
@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  focusOkButton = false;

  // State for the modal dialog
  private dialogStateSubject = new BehaviorSubject<DialogState | null>(null);
  dialogState$ = this.dialogStateSubject.asObservable();

  private dialogResolver: ((result: DialogResult | EmailDialogResult) => void) | null = null;

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

  openOkCancelEmail(config: EmailDialogConfig): Promise<EmailDialogResult> {
    return this.openDialog<EmailDialogResult>({
      ...config,
      type: 'ok-cancel-email'
    });
  }

  openInfo(config: DialogConfig): Promise<DialogResult> {
    return this.openDialog({
      ...config,
      type: 'info'
    });
  }

  private openDialog<T = DialogResult>(cfg: { type: DialogType } & DialogConfig): Promise<T> {
    // Close any existing dialog first
    this.dialogStateSubject.next({
      visible: true,
      type: cfg.type,
      title: cfg.title ?? 'SignIn',
      message: cfg.message ?? '',
      yesLabel: cfg.yesLabel,
      noLabel: cfg.noLabel,
      okLabel: cfg.okLabel,
      cancelLabel: cfg.cancelLabel,
      email: (cfg as EmailDialogConfig).email,
      emailPlaceholder: (cfg as EmailDialogConfig).emailPlaceholder,
      onOkAsync: (cfg as EmailDialogConfig).onOkAsync,
      onOkError: (cfg as EmailDialogConfig).onOkError
    });

    return new Promise<T>((resolve) => {
      this.dialogResolver = (result) => resolve(result as T);
    });
  }

  resolveDialog(result: DialogResult) {
    if (this.dialogResolver) {
      this.dialogResolver(result);
      this.dialogResolver = null;
    }
    this.dialogStateSubject.next(null);
  }

  resolveDialogWithEmail(result: DialogResult, email?: string) {
    if (this.dialogResolver) {
      this.dialogResolver({ result, email });
      this.dialogResolver = null;
    }
    this.dialogStateSubject.next(null);
  }

  cancelDialog() {
    // Called on Esc or when dialog is closed
    if (this.dialogStateSubject.value?.type === 'ok-cancel-email') {
      this.resolveDialogWithEmail('cancel');
      return;
    }

    this.resolveDialog('cancel');
  }
}
