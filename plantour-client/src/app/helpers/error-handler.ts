import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { MessagesService } from '../services/messages-service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: any): void {

    if (error?.message || error?.error.code === 'custom_exception') {
      const messagesService = this.injector.get(MessagesService);
      messagesService.showError(error.message);
      return;
    }

    throw error; 
  }
}