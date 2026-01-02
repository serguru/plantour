import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = '';

      if (error.error instanceof ErrorEvent) {
        errorMsg = `Client-side error: ${error.error.message}`;
      } else {
        errorMsg = `Server-side error: ${error.status} ${error.message}`;
      }

      console.error(errorMsg);
      return throwError(() => new Error(errorMsg));
    })
  );
};