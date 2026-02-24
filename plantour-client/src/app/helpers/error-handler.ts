import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { MessagesService } from '../services/messages-service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: any): void {

    if (error?.error?.isCustom && error?.error?.message) {
      let message = error.error.message;
      const messagesService = this.injector.get(MessagesService);
      if (error.error.code === 'PLAN_LIMIT_REACHED') {
         messagesService.showWarning(message);
      } else if (error.error.message) {  
         messagesService.showError(message);
      }
      return;
    }
    throw error; 
  }
}

