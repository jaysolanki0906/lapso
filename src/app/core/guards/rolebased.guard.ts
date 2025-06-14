import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { OrganizationService } from '../services/organization.service';
import { RolePermissionService } from '../services/role-permission.service';
import { filter, of, switchMap, take } from 'rxjs';

export const rolebaseGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const userService = inject(UserService);
  const orgService = inject(OrganizationService);
  const rolePermissionService = inject(RolePermissionService);

  // Get user from UserService
  const user = userService.userProfile;
  if (!user) {
    router.navigate(['not-authorized'], { skipLocationChange: true });
    return of(false);
  }

  // If you want to check user's status (active), adapt if your model uses a different property
  if (user.status !== 'ACTIVE' || user.is_deleted) {
    router.navigate(['not-authorized'], { skipLocationChange: true });
    return of(false);
  }

  // Set role and permissions for role-based logic
  rolePermissionService.setRole(user.role, user);

  const org = orgService.organization;

  const currentRole = (user.role || '').toUpperCase();
  if (currentRole === 'ADMIN') {
    return of(true);
  }

  // Get required permissions from route data
  const requiredPermissions = route.data['permissions'] as { module: string, permission: string }[] | undefined;
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return of(true);
  }

  // Check if user has all required permissions
  const hasAllPermissions = requiredPermissions.every(req =>
    rolePermissionService.getPermission(req.module, req.permission)
  );
  if (!hasAllPermissions) {
    router.navigate(['not-authorized'], { skipLocationChange: true });
    return of(false);
  }

  // Optionally, re-check user from observable (for async update)
  return userService.userProfile$.pipe(
    filter(user => user !== undefined && user !== null),
    take(1),
    switchMap(user => {
      if (!user) {
        router.navigate(['not-authorized'], { skipLocationChange: true });
        return of(false);
      }
      return of(true);
    })
  );
};