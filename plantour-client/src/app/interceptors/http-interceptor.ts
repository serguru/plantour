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

                    // if (response.error?.code === 'WRONG_TOKEN') {
                    //     messagesService.showWarning('You have no access to Plantour. Please sign in again.');
                    //     router.navigate(['sign-in']);
                    // } else if (response.error?.code === 'WRONG_PARTICIPANT_TOKEN') {
                    //     messagesService.showWarning('You have no participant access to Plantour. Please sign in as participant or ask your administrator to send you a new invitation.');
                    //     router.navigate(['sign-in/participant']);
                    // } else {
                    //     messagesService.showError('Sign in failed. Please check your credentials.');
                    // }




    // let newReq = req;
    // const platformId = inject(PLATFORM_ID);
    // const isBrowser = isPlatformBrowser(platformId);
    // const router = inject(Router);
    // const messagesService = inject(MessagesService);


    // // TODO: process admin and participant sign ins differently
    // const isAuthEndpoint = (url: string) =>
    //     url.includes('/api/users/admin/signin') ||
    //     url.includes('/api/users/participant/signin') ||
    //     url.includes('/api/users/revoke') ||
    //     url.includes('/api/users/admin/confirm-email') ||
    //     url.includes('/api/users/admin/resend-confirmation');

    // const isPasswordUpdateEndpoint = (url: string) =>
    //     url.includes('/api/users/password');

    // const localStorageService = inject(LocalStorageService);

    // // This does NOT rely on the server returning 401, which may not happen on non-protected endpoints.
    // if (isBrowser && token && !isAuthEndpoint(req.url) && !isPasswordUpdateEndpoint(req.url) && isJwtExpired(token)) {

    // }

    // // Attach Authorization header for non-auth endpoints only.
    // if (token && !isAuthEndpoint(req.url)) {
    //     newReq = req.clone({
    //         setHeaders: {
    //             Authorization: `Bearer ${token}`
    //         }
    //     });
    // }

    // return next(newReq).pipe(
    //     catchError((response: any) => {
    //         const statusCode = response?.status ?? response?.error?.statusCode;

    //         if (statusCode === 401) {
    //             if (isAuthEndpoint(req.url)) {
    //                 return throwError(() => response);
    //             }
    //             if (isBrowser) {
    //                 const message = response?.error?.message || '';
    //                 if (message.toLowerCase().includes('email not confirmed')) {
    //                     messagesService.showWarning('Please confirm your email before signing in.');
    //                     return EMPTY;
    //                 }

    //                 usersService.signOut();
    //                 if (response.error?.code === 'WRONG_TOKEN') {
    //                     messagesService.showWarning('You have no access to Plantour. Please sign in again.');
    //                     router.navigate(['sign-in']);
    //                 } else if (response.error?.code === 'WRONG_PARTICIPANT_TOKEN') {
    //                     messagesService.showWarning('You have no participant access to Plantour. Please sign in as participant or ask your administrator to send you a new invitation.');
    //                     router.navigate(['sign-in/participant']);
    //                 } else {
    //                     messagesService.showError('Sign in failed. Please check your credentials.');
    //                 }
    //             }
    //             return EMPTY;
    //         }

    //         return throwError(() => response);
    //     })
    // );
};