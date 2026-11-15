import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from './auth.model';
import { AuthService } from './auth-service';

export const roleGuard = (...roles: Role[]): CanActivateFn => () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  return authService.hasRole(...roles)
    ? true
    : router.createUrlTree(['/forbidden']);
};

