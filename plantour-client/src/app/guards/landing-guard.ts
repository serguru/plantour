import { inject } from '@angular/core';
import { ActivatedRoute, CanMatchFn, Router } from '@angular/router';
import { UsersService } from '../services/users-service';
import { toSignal } from '@angular/core/rxjs-interop';

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
export const dashboardGuard: CanMatchFn = () => {
  const route = inject(ActivatedRoute);
  const params = toSignal(route.paramMap);

  const accessToken = params()?.get('accessToken');
  const refreshToken = params()?.get('refreshToken');
  const usersService = inject(UsersService);

  if (accessToken && refreshToken) {
    const r = {
      accessToken: accessToken,
      refreshToken: refreshToken,
    }
    usersService.applyAuthResponse(r);
  }
  return usersService.isAuthenticatedSignal();
};
