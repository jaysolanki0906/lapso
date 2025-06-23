import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { OrganizationService } from '../services/organization.service';
import { RolePermissionService } from '../services/role-permission.service';
import { filter, of, switchMap, take } from 'rxjs';
import { firstValueFrom } from 'rxjs';


export const rolebaseGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const userService = inject(UserService);
  const orgService = inject(OrganizationService);
  const rolePermissionService = inject(RolePermissionService);

  let user = userService.userProfile;
  if (!user) {
    try {
      user = await firstValueFrom(userService.fetchAndStoreProfile());
    } catch {
      router.navigate(['login']);
      return false;
    }
  }

  if (user.status !== 'ACTIVE' || user.is_deleted) {
    router.navigate(['not-authorized'], { skipLocationChange: true });
    return false;
  }

  rolePermissionService.setRole(user.role, user);

  const requiredPermissions = route.data['permissions'] as { module: string, permission: string }[] | undefined;
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  const hasAllPermissions = requiredPermissions.every(req =>
    rolePermissionService.getPermission(req.module, req.permission)
  );

  if (!hasAllPermissions) {
    router.navigate(['not-authorized'], { skipLocationChange: true });
    return false;
  }
  return true;
};
