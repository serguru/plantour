import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, EMPTY, switchMap, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { MessagesService } from '../services/messages-service';
import { LocalStorageService } from '../services/local-storage-service';
import { UsersService } from '../services/users-service';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {

    const isJwtExpired = (jwt: string): boolean => {
        try {
            const decoded: any = jwtDecode(jwt);
            const exp: number | undefined = decoded?.exp;
            if (!exp) {
                return true;
            }
            const now = Math.floor(Date.now() / 1000);
            return exp <= now;
        } catch {
            return true;
        }
    };

    let newReq = req;
    const platformId = inject(PLATFORM_ID);
    const isBrowser = isPlatformBrowser(platformId);
    const router = inject(Router);
    const messagesService = inject(MessagesService);
    const usersService = inject(UsersService);
    // TODO: process admin and participant sign ins differently
    const isAuthEndpoint = (url: string) =>
        url.includes('/api/users/admin/signin') ||
        url.includes('/api/users/participant/signin') ||
        url.includes('/api/users/revoke') ||
        url.includes('/api/users/admin/confirm-email') ||
        url.includes('/api/users/admin/resend-confirmation');

    const isPasswordUpdateEndpoint = (url: string) =>
        url.includes('/api/users/password');

    const localStorageService = inject(LocalStorageService);
    const token = isBrowser ? localStorageService.getItem('accessToken') : null;

    // This does NOT rely on the server returning 401, which may not happen on non-protected endpoints.
    if (isBrowser && token && !isAuthEndpoint(req.url) && !isPasswordUpdateEndpoint(req.url) && isJwtExpired(token)) {

    }

    // Attach Authorization header for non-auth endpoints only.
    if (token && !isAuthEndpoint(req.url)) {
        newReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(newReq).pipe(
        catchError((response: any) => {
            const statusCode = response?.status ?? response?.error?.statusCode;

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