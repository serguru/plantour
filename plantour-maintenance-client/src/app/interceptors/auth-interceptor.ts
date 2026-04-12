import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, EMPTY, throwError } from 'rxjs';
import { UsersService } from '../services/users-service';

const isSignInRequest = (url: string): boolean => url.includes('/auth/sign-in');

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const usersService = inject(UsersService);
  const accessToken = usersService.accessToken();

  const authorizedRequest = accessToken && !isSignInRequest(request.url)
    ? request.clone({
        headers: request.headers.set('Authorization', `Bearer ${accessToken}`)
      })
    : request;

  return next(authorizedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isSignInRequest(request.url)) {
        usersService.handleUnauthorized();
        return EMPTY;
      }

      return throwError(() => error);
    })
  );
};
