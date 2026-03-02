import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { UsersService } from '../services/users-service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

function addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
}

function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, usersService: UsersService) {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return usersService.refreshTokens().pipe(
            switchMap((tokenResponse: any) => {
                isRefreshing = false;
                refreshTokenSubject.next(tokenResponse.accessToken);
                // Retry the original request with the new token
                return next(addTokenHeader(request, tokenResponse.accessToken));
            }),
            catchError((err) => {
                isRefreshing = false;
                // If refresh fails, user must log in again
                usersService.signOut();
                return throwError(() => err);
            })
        );
    } else {
        // If a refresh is already in progress, wait until it's done
        return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => next(addTokenHeader(request, token)))
        );
    }
}

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
    const usersService = inject(UsersService);
    const token = usersService.accessToken;

    let authReq = req;
    if (token) {
        authReq = addTokenHeader(req, token);
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // If error is 401, handle token refresh
            if (error.status === 401 && token) {
                return handle401Error(authReq, next, usersService);
            }
            return throwError(() => error);
        })
    );
};