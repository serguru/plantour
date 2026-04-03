import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, EMPTY, filter, finalize, switchMap, take, throwError } from 'rxjs';
import { UsersService } from '../services/users-service';
import { LoadingService } from '../services/loading-service';
import { MessagesService } from '../services/messages-service';

let isRefreshing = false;
let refreshTokenError: HttpErrorResponse | null = null;
let isHandlingSessionExpiry = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);
const refreshTokenPath = '/users/refresh-token';
const sessionExpiredMessage = 'Your session has expired. Please sign in again or ask your administrator to re-issue your invitation.';
const authRedirectExcludedPaths = [
    '/users/admin/send-signin-email',
    '/users/admin/signin-token',
    '/users/participant/signin',
    '/users/admin/social/signin'
];

const addTokenHeader = (request: HttpRequest<any>, token: string) => {
    return request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
}

const isRefreshRequest = (request: HttpRequest<any>) => request.url.includes(refreshTokenPath);

const shouldSkipSessionRedirect = (request: HttpRequest<any>) => authRedirectExcludedPaths.some(path => request.url.includes(path));

const handleSessionExpired = (
    request: HttpRequest<any>,
    usersService: UsersService,
    router: Router,
    messagesService: MessagesService,
    isBrowser: boolean,
) => {
    isRefreshing = false;
    refreshTokenError = null;
    refreshTokenSubject.next(null);
    usersService.signOut();

    if (!isBrowser || shouldSkipSessionRedirect(request)) {
        return EMPTY;
    }

    if (!isHandlingSessionExpiry && !router.url.startsWith('/sign-in')) {
        isHandlingSessionExpiry = true;
        messagesService.showWarning(sessionExpiredMessage);
        void router.navigate(['/sign-in']).finally(() => {
            isHandlingSessionExpiry = false;
        });
    }

    return EMPTY;
};

const handle401Error = (
    request: HttpRequest<any>,
    next: HttpHandlerFn,
    usersService: UsersService,
    router: Router,
    messagesService: MessagesService,
    isBrowser: boolean,
) => {
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
                return handleSessionExpired(request, usersService, router, messagesService, isBrowser);
            })
        );
    } else {
        // If a refresh is already in progress, wait until it's done
        return refreshTokenSubject.pipe(
            filter(token => token !== null || refreshTokenError !== null),
            take(1),
            switchMap(token => {
                if (refreshTokenError) {
                    return handleSessionExpired(request, usersService, router, messagesService, isBrowser);
                }

                return next(addTokenHeader(request, token!));
            })
        );
    }
}

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
    const usersService = inject(UsersService);
    const loadingService = inject(LoadingService);
    const messagesService = inject(MessagesService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);
    const token = usersService.accessToken;
    const refreshToken = usersService.refreshToken;
    const isBrowser = isPlatformBrowser(platformId);

    let authReq = req;
    if (token) {
        authReq = addTokenHeader(req, token);
    }

    loadingService.start();
    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status !== 401) {
                return throwError(() => error);
            }

            if (isRefreshRequest(authReq)) {
                return handleSessionExpired(authReq, usersService, router, messagesService, isBrowser);
            }

            if (token && refreshToken) {
                return handle401Error(authReq, next, usersService, router, messagesService, isBrowser);
            }

            if (shouldSkipSessionRedirect(authReq)) {
                return throwError(() => error);
            }

            return handleSessionExpired(authReq, usersService, router, messagesService, isBrowser);
        }),
        finalize(() => loadingService.stop())
    );
};