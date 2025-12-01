import { Component, OnDestroy, OnInit } from '@angular/core';
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
  state: DialogState | null = null;
  visible = false;

  private sub?: Subscription;
  private resolved = false;

  constructor(private messagesService: MessagesService) {}

  ngOnInit(): void {
    this.sub = this.messagesService.dialogState$.subscribe((state) => {
      this.state = state;
      this.visible = !!state;
      this.resolved = false;
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
}
