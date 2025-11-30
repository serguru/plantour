import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UsersService } from './users-service';

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
