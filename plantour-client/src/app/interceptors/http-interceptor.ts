import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, throwError } from 'rxjs';
import { MessagesService } from '../services/messages-service';
import { UsersService } from '../services/users-service';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {

    let newReq = req;
    const token = localStorage.getItem('accessToken');
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
    return next(newReq).pipe(
        catchError((response: any) => {
            if (response.error?.statusCode === 401) {
                usersService.signOut();
                if (response.error?.code === 'WRONG_TOKEN') {
                    messagesService.showWarning('Your session has expired. Please sign in again.');
                    router.navigate(['sign-in']);
                } else if (response.error?.code === 'WRONG_PARTICIPANT_TOKEN') {
                    messagesService.showWarning('You don’t have participant access to Plantour. Please sign-in as participant or ask your administrator to send you a new invitation.');
                    router.navigate(['sign-in/participant']);
                } else {
                    messagesService.showError('Wrong email or password');
                }
                return EMPTY;
            }
            return throwError(() => response);
        })
    );
};