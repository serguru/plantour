import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { MessagesService } from '../services/messages-service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: any): void {
   
    const message = error.message ? error.message : error.toString();
    const messagesService = this.injector.get(MessagesService);
    messagesService.showError('An unexpected error occurred: ' + message);

    throw error; 
  }
}