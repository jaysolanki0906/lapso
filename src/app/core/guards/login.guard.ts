import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { RolePermissionService } from '../services/role-permission.service';
import { of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export const loginGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userService = inject(UserService);

  const rolePermissionService = inject(RolePermissionService);

  // Use access_token and refresh_token for session check
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');

  if (!accessToken || !refreshToken) {
    // Not logged in, allow access to login page
    return true;
  }

  // If tokens exist, fetch and set user info, then redirect to dashboard
  return userService.fetchAndStoreProfile().pipe(
    tap({
      next: (user) => {
        if (user && user.role) {
          rolePermissionService.setRole(user.role, user.auth_items);
        }
        router.navigate(['/dashboard']);
      },
      error: () => {
        // If fetching user fails, fallback to default USER and redirect anyway
        rolePermissionService.setRole('USER', {});
        router.navigate(['/dashboard']);
      }
    }),
    // Prevent navigation to login page when already logged in
    map(() => false),
    catchError(() => {
      rolePermissionService.setRole('USER', {});
      router.navigate(['/dashboard']);
      return of(false);
    })
  );
};