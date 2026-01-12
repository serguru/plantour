import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
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
export const landingRegisteredUserGuard: CanMatchFn = () => {
  const usersService = inject(UsersService);
  return usersService.isAuthenticatedSignal();
};
