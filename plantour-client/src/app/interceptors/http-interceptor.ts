import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, EMPTY, switchMap, throwError } from 'rxjs';
import { MessagesService } from '../services/messages-service';
import { LocalStorageService } from '../services/local-storage-service';
import { UsersService } from '../services/users-service';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {

    let newReq = req;
    const platformId = inject(PLATFORM_ID);
    const isBrowser = isPlatformBrowser(platformId);
    const localStorageService = inject(LocalStorageService);
    const token = isBrowser ? localStorageService.getItem('accessToken') : null;
    if (token) {
        // Clone request and add Authorization header
        newReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }
    const router = inject(Router);
    const messagesService = inject(MessagesService);
    const usersService = inject(UsersService);
    // TODO: process admin and participant sign ins differently
    const isAuthEndpoint = (url: string) =>
        url.includes('/api/users/admin/signin') ||
        url.includes('/api/users/participant/signin') ||
        url.includes('/api/users/refresh') ||
        url.includes('/api/users/revoke') ||
        url.includes('/api/users/admin/confirm-email') ||
        url.includes('/api/users/admin/resend-confirmation');

    return next(newReq).pipe(
        catchError((response: any) => {
            const statusCode = response?.status ?? response?.error?.statusCode;
            if (statusCode === 401 && !isAuthEndpoint(req.url)) {
                const refreshToken = usersService.getRefreshToken();
                if (!refreshToken) {
                    usersService.signOut();
                    if (isBrowser) {
                        messagesService.showWarning('Your session has expired. Please sign in again.');
                        router.navigate(['sign-in']);
                    }
                    return EMPTY;
                }

                return usersService.refreshTokens().pipe(
                    switchMap((auth) => {
                        const retried = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${auth.accessToken}`
                            }
                        });
                        return next(retried);
                    }),
                    catchError((refreshError) => {
                        usersService.signOut();
                        if (isBrowser) {
                            const code = refreshError?.error?.code;
                            if (code === 'WRONG_PARTICIPANT_TOKEN') {
                                messagesService.showWarning('Your access has expired. Please ask your administrator to re-send the invitation email.');
                                router.navigate(['sign-in/participant']);
                            } else {
                                messagesService.showWarning('Your session has expired. Please sign in again.');
                                router.navigate(['sign-in']);
                            }
                        }
                        return EMPTY;
                    })
                );
            }

            if (statusCode === 401) {
                if (isAuthEndpoint(req.url)) {
                    return throwError(() => response);
                }
                if (isBrowser) {
                    const message = response?.error?.message || '';
                    if (message.toLowerCase().includes('email not confirmed')) {
                        messagesService.showWarning('Please confirm your email before signing in.');
                        return EMPTY;
                    }

                    usersService.signOut();
                    if (response.error?.code === 'WRONG_TOKEN') {
                        messagesService.showWarning('You have no access to Plantour. Please sign in again.');
                        router.navigate(['sign-in']);
                    } else if (response.error?.code === 'WRONG_PARTICIPANT_TOKEN') {
                        messagesService.showWarning('You have no participant access to Plantour. Please sign in as participant or ask your administrator to send you a new invitation.');
                        router.navigate(['sign-in/participant']);
                    } else {
                        messagesService.showError('Sign in failed. Please check your credentials.');
                    }
                }
                return EMPTY;
            }

            return throwError(() => response);
        })
    );
};