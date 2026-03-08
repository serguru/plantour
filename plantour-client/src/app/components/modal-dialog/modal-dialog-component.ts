import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

import {
  DialogState,
  DialogResult,
  MessagesService
} from '../../services/messages-service';

@Component({
  selector: 'app-modal-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './modal-dialog-component.html',
  styleUrls: ['./modal-dialog-component.scss']
})
export class ModalDialogComponent implements OnInit, OnDestroy {

  @ViewChild('okButton') okButton!: ElementRef;
  @ViewChild('cancelButton') cancelButton!: ElementRef;
  @ViewChild('emailInput') emailInput!: ElementRef;

  state: DialogState | null = null;
  visible = false;
  email = '';
  emailTouched = false;
  emailSubmitError = '';
  emailSubmitting = false;

  private sub?: Subscription;
  private resolved = false;
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  constructor(private messagesService: MessagesService) {}

  onDialogShow() {
    if (this.state?.type === 'ok-cancel-email') {
      setTimeout(() => {
        this.emailInput?.nativeElement.focus();
      });
      return;
    }

    if (this.messagesService.focusOkButton) {
      setTimeout(() => {
        this.okButton?.nativeElement.focus();
      });
      return;
    } 
    setTimeout(() => {
      this.cancelButton?.nativeElement.focus();
    }); 
  }

  ngOnInit(): void {
    this.sub = this.messagesService.dialogState$.subscribe((state) => {
      this.state = state;
      this.visible = !!state;
      this.resolved = false;
      this.email = state?.email ?? '';
      this.emailTouched = false;
      this.emailSubmitError = '';
      this.emailSubmitting = false;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onDialogHide() {
    // Fired on Esc or when user closes dialog (if closable)
    if (!this.resolved) {
      this.resolved = true;
      this.messagesService.cancelDialog();
    }
  }

  onAction(result: DialogResult) {
    this.resolved = true;
    this.messagesService.resolveDialog(result);
  }

  get isEmailValid(): boolean {
    return this.emailPattern.test(this.email.trim());
  }

  onEmailInput(value: string) {
    this.email = value;
    this.emailSubmitError = '';
  }

  onEmailBlur() {
    this.emailTouched = true;
  }

  async onEmailOk() {
    this.emailTouched = true;
    if (!this.isEmailValid) {
      return;
    }

    if (this.emailSubmitting) {
      return;
    }

    const emailValue = this.email.trim();
    const onOkAsync = this.state?.onOkAsync;
    const onOkError = this.state?.onOkError;

    if (onOkAsync) {
      this.emailSubmitting = true;
      this.emailSubmitError = '';

      try {
        const message = await onOkAsync(emailValue);
        if (message) {
          this.emailSubmitError = message;
          return;
        }
      } catch (error: unknown) {
        if (onOkError) {
          const message = await onOkError(error, emailValue);
          if (message) {
            this.emailSubmitError = message;
          }
          return;
        }

        this.emailSubmitError = 'Unexpected error. Please try again.';
        return;
      } finally {
        this.emailSubmitting = false;
      }
    }

    this.resolved = true;
    this.messagesService.resolveDialogWithEmail('ok', emailValue);
  }

  onEmailCancel() {
    this.resolved = true;
    this.messagesService.resolveDialogWithEmail('cancel');
  }
}
