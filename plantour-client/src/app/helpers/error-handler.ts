import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { MessagesService } from '../services/messages-service';
import { Router } from '@angular/router';




@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) { }

  handleError(error: any): void {
    if (error.status == 429) {
      return;
    }

    if (error?.error?.isCustom && error?.error?.message) {
      let message = error.error.message;
      const messagesService = this.injector.get(MessagesService);
      if (error.error.code === 'PLAN_LIMIT_REACHED') {
        messagesService.showWarning(message);
      } else if (error.error.code === 'REFRESH_TOKEN_FAILED') {
        messagesService.showWarning("Your session has expired. Please sign in again or ask your administrator to re-issue your invitation.");
        this.injector.get(Router).navigate(['sign-in']);
      } else if (error.error.message) {
        messagesService.showError(message);
      }
      return;
    } else if (error?.message) {
      const messagesService = this.injector.get(MessagesService);
      messagesService.showError(error.message);
      return;
    }
    throw error;
  }
}

