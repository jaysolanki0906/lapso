import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { RolePermissionService } from '../services/role-permission.service';
import { firstValueFrom } from 'rxjs';

export const rolebaseGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const userService = inject(UserService);
  const rolePermissionService = inject(RolePermissionService);

  const routeToModuleMap: { [path: string]: string } = {
    items: 'product',
    'voucher/invoice': 'sales_voucher',
    service: 'services',
    vouchers: 'service_voucher',
    servicecall: 'service_call',
    dashboard: 'dashboard',
    users: 'user',
    roles: 'role',
    warranty: 'warranty_voucher',
    config: 'config',
    contact: 'contact',
    review: 'review',
    organization: 'organization'
  };

  const user = userService.userProfile;

  if (!user || user.status !== 'ACTIVE' || user.is_deleted) {
    router.navigate(['not-authorized'], { skipLocationChange: true });
    return false;
  }

  rolePermissionService.setRole(user.role, user.auth_items);

  const requiredPermissions = route.data['permissions'] as { module: string, permission?: string }[] | undefined;
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(req =>
      rolePermissionService.getPermission(req.module, req.permission)
    );
    if (!hasAllPermissions) {
      router.navigate(['not-authorized'], { skipLocationChange: true });
      return false;
    }
  } else {
    const firstSegment = route.url[0]?.path ?? '';
    const moduleKey = routeToModuleMap[firstSegment];
    if (moduleKey) {
      const modulePermissions = user.auth_items?.[moduleKey];
      const hasAnyPermission = modulePermissions
        ? Object.values(modulePermissions).some(val => val === true)
        : false;
      if (!hasAnyPermission) {
        router.navigate(['not-authorized'], { skipLocationChange: true });
        return false;
      }
    }
  }

  return true;
};
