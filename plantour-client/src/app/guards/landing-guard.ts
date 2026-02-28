import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { UsersService } from '../services/users-service';


/**
 * Landing Guard for New Users - allows access only to non-authenticated users
 */
export const landingNewUserGuard: CanMatchFn = () => {
  const usersService = inject(UsersService);
  return !usersService.isAuthenticatedSignal();
};

/**
 * Landing Guard for Registered Users - allows access only to authenticated users
 */
export const landingExistingUserGuard: CanMatchFn = (route, segments) => {
  const usersService = inject(UsersService);
  return usersService.isAuthenticatedSignal();
};

export const dashboardGuard: CanActivateFn = (route, segments) => {
  
  const router = inject(Router);

  const navigation = router.getCurrentNavigation();
  const urlTree = navigation?.extractedUrl;

  const accessToken = urlTree?.queryParams['accessToken'];
  const usersService = inject(UsersService);


  if (accessToken) {
    usersService.signOut();
    const r = {
      accessToken: accessToken,
    }
    usersService.applyAuthResponse(r);
    return true;;
  }
  return usersService.isAuthenticatedSignal();
};



