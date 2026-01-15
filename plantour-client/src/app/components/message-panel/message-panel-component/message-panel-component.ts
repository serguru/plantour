import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

type MessageType = 'error' | 'warning' | 'info';

@Component({
  selector: 'app-message-panel',
  imports: [CommonModule],
  templateUrl: './message-panel-component.html',
  styleUrl: './message-panel-component.scss',
})
export class MessagePanel {
  @Input() messageType: MessageType = 'info';
  @Input() messageText: string = '';

  config = {
    error: {
      icon: 'pi-exclamation-circle',
    },
    warning: {
      icon: 'pi-question-circle',
    },
    info: {
      icon: 'pi-info-circle',
    }
  }

}
