import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ErrorService } from '../services/error-service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: unknown): void {
    // Delay injection to avoid cyclic DI issues
    const errorSvc = this.injector.get(ErrorService);

    const message =
      error instanceof Error ? error.message : (String(error) || 'Unknown error');

    const stack = error instanceof Error ? error.stack : undefined;

    errorSvc.push({
      message,
      stack,
      level: 'error',
      context: { source: 'GlobalErrorHandler' }
    });

    // Optionally rethrow or log to console (keep minimal here)
    // console.error(error);
  }
}
