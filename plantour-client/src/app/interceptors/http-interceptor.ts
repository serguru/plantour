import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, finalize, switchMap, take, throwError } from 'rxjs';
import { UsersService } from '../services/users-service';
import { LoadingService } from '../services/loading-service';

let isRefreshing = false;
let refreshTokenError: HttpErrorResponse | null = null;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

const addTokenHeader = (request: HttpRequest<any>, token: string) => {
    return request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
}

const handle401Error = (request: HttpRequest<any>, next: HttpHandlerFn, usersService: UsersService) => {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenError = null;
        refreshTokenSubject.next(null);

        return usersService.refreshTokens().pipe(
            switchMap((tokenResponse) => {
                isRefreshing = false;
                refreshTokenError = null;
                refreshTokenSubject.next(tokenResponse.accessToken);
                // Retry the original request with the new token
                return next(addTokenHeader(request, tokenResponse.accessToken));
            }),
            catchError((err: HttpErrorResponse) => {
                isRefreshing = false;
                refreshTokenError = err;
                refreshTokenSubject.next(null);
                // If refresh fails, user must log in again
                usersService.signOut();
                return throwError(() => err);
            })
        );
    } else {
        // If a refresh is already in progress, wait until it's done
        return refreshTokenSubject.pipe(
            filter(token => token !== null || refreshTokenError !== null),
            take(1),
            switchMap(token => {
                if (refreshTokenError) {
                    return throwError(() => refreshTokenError);
                }

                return next(addTokenHeader(request, token!));
            })
        );
    }
}

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
    const usersService = inject(UsersService);
    const loadingService = inject(LoadingService);
    const token = usersService.accessToken;

    let authReq = req;
    if (token) {
        authReq = addTokenHeader(req, token);
    }

    loadingService.start();
    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // If error is 401, handle token refresh
            if (error.status === 401 && token) {
                return handle401Error(authReq, next, usersService);
            }
            return throwError(() => error);
        }),
        finalize(() => loadingService.stop())
    );
};