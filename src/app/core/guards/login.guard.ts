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

  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');

  if (!accessToken || !refreshToken) {
    return true;
  }

  return userService.fetchAndStoreProfile().pipe(
    tap({
      next: (user) => {
        if (user && user.role) {
          rolePermissionService.setRole(user.role, user.auth_items);
        }
        router.navigate(['/dashboard']);
      },
      error: () => {
        rolePermissionService.setRole('USER', {});
        router.navigate(['/dashboard']);
      }
    }),
    map(() => false),
    catchError(() => {
      rolePermissionService.setRole('USER', {});
      router.navigate(['/dashboard']);
      return of(false);
    })
  );
};