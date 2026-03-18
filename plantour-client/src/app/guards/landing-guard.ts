import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsersService } from '../services/users-service';


/**
 * Landing Guard for the public root page.
 * Authenticated users are redirected to the dedicated dashboard route.
 */
export const landingRedirectGuard: CanActivateFn = (route) => {
  const usersService = inject(UsersService);
  if (!usersService.isAuthenticatedSignal()) {
    return true;
  }

  const router = inject(Router);
  return router.createUrlTree(['/dashboard'], {
    queryParams: route.queryParams,
  });
};

export const dashboardGuard: CanActivateFn = (route, segments) => {
  
  const router = inject(Router);

  const navigation = router.getCurrentNavigation();
  const urlTree = navigation?.extractedUrl;

  const accessToken = urlTree?.queryParams['accessToken'];
  const refreshToken = urlTree?.queryParams['refreshToken'];
  const usersService = inject(UsersService);

  if (accessToken && refreshToken) {
    usersService.signOut();
    const r = {
      accessToken: accessToken,
      refreshToken: refreshToken,
    }
    usersService.applyAuthResponse(r);
    return true;;
  }
  const isAuthenticated = usersService.isAuthenticatedSignal();
  if (isAuthenticated) {
    return true;
  }
  router.navigate(['/']);
  return false;
};



