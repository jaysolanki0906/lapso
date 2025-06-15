import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthServiceService } from '../services/auth-service.service';
import { UserService } from '../services/user.service';
import { RolePermissionService } from '../services/role-permission.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const authService = inject(AuthServiceService);
  const userService = inject(UserService);
  const rolePermissionService = inject(RolePermissionService);

  // 1. Check token
  const token = localStorage.getItem('access_token');
  if (!token) {
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  // 2. Ensure user profile is loaded
  let user = userService.userProfile;
  if (!user) {
    try {
      user = await firstValueFrom(userService.fetchAndStoreProfile());
    } catch {
      authService.logout();
      return false;
    }
  }

  // 3. Block deleted/inactive users
  if (!user || user.is_deleted || user.status !== 'ACTIVE') {
    authService.logout();
    return false;
  }

  // 4. Set role and permissions in RolePermissionService
  rolePermissionService.setRole(user.role, user.auth_items);

  // 5. Check for required roles (if any)
  const allowedRoles = route.data['roles'] as string[] | undefined;
  if (allowedRoles && allowedRoles.length > 0) {
    // Case-insensitive role check
    const userRole = (user.role || '').toUpperCase();
    const roleAllowed = allowedRoles.map(r => r.toUpperCase()).includes(userRole);
    if (!roleAllowed) {
      router.navigate(['/not-authorized'], { skipLocationChange: true });
      return false;
    }
  }

  // 6. Check for required permissions (if any)
  const requiredPermissions = route.data['permissions'] as { module: string, permission?: string }[] | undefined;
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(req =>
      rolePermissionService.getPermission(req.module, req.permission)
    );
    if (!hasAllPermissions) {
      router.navigate(['/not-authorized'], { skipLocationChange: true });
      return false;
    }
  }

  // All checks passed!
  return true;
};