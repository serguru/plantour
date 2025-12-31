import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UsersService } from '../services/users-service';
import { MessagesService } from '../services/messages-service';
import { isGuid } from '../helpers/utils';
import { TripDto, TripService } from '../services/trip-service';
import { AppService } from '../services/app-service';
import { catchError, map, tap, throwError } from 'rxjs';

/**
 * Auth Guard - allows access only to authenticated users
 */
export const authGuard: CanActivateFn = (route, state) => {
  const usersService = inject(UsersService);
  const router = inject(Router);

  if (usersService.isAuthenticated) {
    return true;
  }

  // Redirect to login page if not authenticated
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Admin Guard - allows access only to authenticated admin users
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const usersService = inject(UsersService);
  const router = inject(Router);

  const currentUser = usersService.currentUser();

  if (usersService.isAuthenticated && currentUser?.role === 'Admin') {
    return true;
  }

  // If authenticated but not admin, redirect to dashboard
  if (usersService.isAuthenticated) {
    router.navigate(['/']);
    return false;
  }

  // If not authenticated, redirect to login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Participant Guard - allows access only to authenticated participant users
 */
export const participantGuard: CanActivateFn = (route, state) => {
  const usersService = inject(UsersService);
  const router = inject(Router);

  const currentUser = usersService.currentUser();

  if (usersService.isAuthenticated && currentUser?.role === 'Participant') {
    return true;
  }

  // If authenticated but not participant, redirect to land
  if (usersService.isAuthenticated) {
    router.navigate(['/']);
    return false;
  }

  // If not authenticated, redirect to login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const checkTripIdGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const messagesService = inject(MessagesService);

  const pathConfig = route.routeConfig?.path || '';
  const shouldHaveTripId = pathConfig.includes(':tripId');


  if (!shouldHaveTripId) {
    return true;
  }
  const tripId = route.params['tripId'];

  if (!tripId) {
    messagesService.showWarning('No trip specified in url. Please specify a trip to proceed.');
    router.navigate(['/trips']);
    return false;
  }

  if (!isGuid(tripId)) {
    messagesService.showWarning('Trip specified in url is invalid. Please specify a valid trip to proceed.');
    router.navigate(['/trips']);
    return false;
  }

  const appService = inject(AppService);
  let trip = appService.tripSelectedValue();
  if (trip && trip.id == tripId) {
    return true;
  }
  const tripService = inject(TripService);
  return tripService.getById(tripId).pipe(
    catchError(error => {

      if (error.status === 404) {
        messagesService.showWarning('Trip specified in url does not exist. Please specify a valid trip to proceed.');
        router.navigate(['/trips']);
        return throwError(() => null);
      }
      return throwError(() => error);
    }),

    map((trip: TripDto) => {
      if (!trip) {
        messagesService.showWarning('Trip specified in url does not exist. Please specify a valid trip to proceed.');
        router.navigate(['/trips']);
        return false;
      }
      appService.updateTripSelected(trip);
      return true;
    })
  );
};

