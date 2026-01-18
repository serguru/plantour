import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { MessagesService } from '../services/messages-service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: any): void {
    let message = '';

    if (error?.error.code === 'custom_exception') {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    }

    if (message) {
      const messagesService = this.injector.get(MessagesService);
      messagesService.showError(message);
      return;
    }

    throw error; 
  }
}