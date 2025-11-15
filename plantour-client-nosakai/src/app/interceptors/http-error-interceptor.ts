import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ErrorService } from '../services/error-service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private errorService: ErrorService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse) {
          const friendly = this.normalizeHttpError(err);
          this.errorService.push(friendly);
        } else {
          this.errorService.push({
            message: String(err),
            context: { reqUrl: req.url },
            level: 'error'
          });
        }
        return throwError(() => err);
      })
    );
  }

  private normalizeHttpError(err: HttpErrorResponse) {
    const msg = err.error?.message || err.message || `HTTP error: ${err.status}`;
    return {
      message: msg,
      code: err.status,
      context: {
        url: err.url,
        method: err.type || 'unknown',
        error: err.error
      },
      level: 'error'
    };
  }
}
