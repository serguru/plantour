import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { UsersService } from '../services/users-service';
import { MessagesService } from '../services/messages-service';
import { isGuid } from '../helpers/utils';
import { TripDto, TripService } from '../services/trip-service';
import { AppService } from '../services/app-service';
import { catchError, map, tap, throwError } from 'rxjs';
import { CurrentTripService } from '../services/current-trip-service';
import { toSignal } from '@angular/core/rxjs-interop';


export const publicGuard: CanActivateFn = (route, state) => {
  const usersService = inject(UsersService);
  if (!usersService.isAuthenticatedSignal()) {
    return true;
  }
  const router = inject(Router);
  router.navigate(['/dashboard']);
  return false;
};

export const signInGuard: CanActivateFn = (route, state) => {
  const usersService = inject(UsersService);
  if (!usersService.isAuthenticatedSignal() || usersService.isTemporarySignal()) {
    return true;
  }
  const router = inject(Router);
  router.navigate(['/dashboard']);
  return false;
};


/**
 * Admin Guard - allows access only to authenticated admin users
 */
export const adminOnlyGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const usersService = inject(UsersService);
  return usersService.currentUserOk$('admin');
};



export const adminOrParticipantGuard: CanActivateFn = (route, state) => {
  const usersService = inject(UsersService);
  return usersService.currentUserOk$();
};


export const checkTripIdGuard: CanActivateFn = (route, state) => {

  const checkCurrentUserIncluded = (trip: TripDto, path: string): boolean => {
    if (["trip-things", "trip-packs", "trip-todos", "trip-expenses", "itinerary"].some(x => path.includes(x)) && !trip.currentUserIncluded) {
      messagesService.showWarning('Access to this page is restricted as you are not a participant of this trip');
      router.navigate(['/trips']);
      return false;
    }
    return true;
  }

  let tripId = route.params['tripId'] ?? route.params['id'];

  if (!tripId) {
    throw new Error('TripId parameter is missing in route');
  }

  const router = inject(Router);
  const messagesService = inject(MessagesService);

  const currentTripService = inject(CurrentTripService);
  const currentTripDtoSignal = toSignal(currentTripService.currentTripDto$, { initialValue: null });


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

  let trip = currentTripDtoSignal();

  if (trip && trip.id == tripId) {
    return checkCurrentUserIncluded(trip, route.routeConfig?.path || '');
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

      if (!checkCurrentUserIncluded(trip, route.routeConfig?.path || '')) {
        return false;
      }

      currentTripService.updateCurrentTripId(trip.id);
      return true;
    })
  );
};

